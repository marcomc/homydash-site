import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { content, languages } from '../src/content.mjs';
const origin = 'https://homydash.marcomc.com';
const keys = Object.keys(content.en).sort();
let pages = 0, links = 0;
const hrefs = new Set();
for (const [lang, [, tag]] of Object.entries(languages)) {
  assert.deepEqual(Object.keys(content[lang]).sort(), keys, `${lang}: missing translation keys`);
  assert.equal(content[lang].steps.length, 4);
  assert.equal(content[lang].help.length, 4);
  for (const value of Object.values(content[lang]).flat(2)) assert.ok(typeof value === 'string' && value.trim(), `${lang}: empty content`);
  for (const page of ['', 'support', 'privacy', 'meta']) {
    const path = `${lang === 'en' ? '/' : `/${lang}/`}${page}${page && page !== 'meta' ? '/' : ''}`;
    const html = await readFile(resolve('dist', `.${path}`, 'index.html'), 'utf8');
    assert.ok(html.includes(`<html lang="${tag}">`));
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal((html.match(/hreflang="x-default"/g) || []).length, 1);
    for (const [, [, alternate]] of Object.entries(languages)) assert.ok(html.includes(`rel="alternate" hreflang="${alternate}"`));
    assert.ok(!/<script\b|<form\b|<iframe\b|<input\b|\son\w+=/i.test(html));
    assert.ok(!/TODO|TO CONFIRM|DA CONFERMARE|App Store|US\$|19\.99|49[,.]99/.test(html));
    assert.ok(html.includes(process.env.SITE_INDEXABLE === '1' && ['', 'support'].includes(page) ? 'index, follow' : 'noindex, follow'));
    assert.ok(html.includes('https://schema.org/WebPage'));
    assert.ok(!html.includes('OhMyDash!'));
    for (const [, source] of html.matchAll(/src="([^"]+)"/g)) await stat(resolve('dist', `.${source}`));
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (href.startsWith('https:')) assert.ok(href.startsWith(origin + '/'));
      if (!href.startsWith('/')) continue;
      hrefs.add(href); links++;
      let target = resolve('dist', `.${href}`);
      if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
      await stat(target);
    }
    pages++;
  }
}
const notFound = await readFile('dist/404.html', 'utf8');
for (const [, href] of notFound.matchAll(/href="([^"]+)"/g)) {
  if (!href.startsWith('/')) continue;
  let target = resolve('dist', `.${href}`);
  if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
  await stat(target);
}
const aasa = JSON.parse(await readFile('dist/.well-known/apple-app-site-association', 'utf8'));
assert.deepEqual(aasa.applinks.details.map(d => d.appIDs), [['P73JP6JAPH.com.marcomc.OhMyDash']]);
assert.deepEqual(aasa.applinks.details.flatMap(d => d.components.map(c => c['/'])), ['/meta']);
assert.equal((await stat('dist/.well-known/apple-app-site-association')).size < 128 * 1024, true);
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, 10);
assert.ok(!sitemap.includes('privacy') && !sitemap.includes('meta'));
const llms = await readFile('dist/llms.txt', 'utf8');
assert.ok(llms.startsWith('# HoMyDash!') && llms.includes('in development'));
const css = await readFile('dist/style.css', 'utf8');
assert.ok(!/@import|url\(|animation:/.test(css));
if (process.env.CHECK_URL) {
  const base = process.env.CHECK_URL;
  for (const href of hrefs) assert.equal((await fetch(base + href, { redirect: 'manual' })).status, 200, href);
  const aasaResponse = await fetch(base + '/.well-known/apple-app-site-association', { redirect: 'manual' });
  assert.equal(aasaResponse.status, 200);
  assert.equal(aasaResponse.headers.get('content-type'), 'application/json');
  for (const suffix of ['', '?code=SYNTHETIC_TEST&state=SYNTHETIC_TEST']) {
    const response = await fetch(base + '/meta' + suffix, { redirect: 'manual' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    const html = await response.text();
    assert.ok(!html.includes('SYNTHETIC_TEST'));
    assert.ok(!html.includes('<script'));
  }
  const plain = await (await fetch(base + '/meta')).text();
  const query = await (await fetch(base + '/meta?code=SYNTHETIC_TEST')).text();
  assert.equal(query, plain, 'Callback must be independent of parameters');
  assert.equal((await fetch(base + '/not-a-page')).status, 404);
  assert.equal((await fetch(base + '/review/editorial.md')).status, 404);
  assert.equal((await fetch(base + '/src/content.mjs')).status, 404);
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
}
console.log(`PASS: ${pages} pages, ${links} local links, 5 complete locales, exact AASA, content and privacy guards${process.env.CHECK_URL ? ', HTTP routes/MIME/404/isolation/callback negative paths' : ''}.`);
