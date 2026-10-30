import { mkdir, rm, writeFile, cp } from 'node:fs/promises';
import { content, languages, media } from '../src/content.mjs';
export const origin = 'https://homydash.marcomc.com';
export const route = (lang, page = '') => `${lang === 'en' ? '/' : `/${lang}/`}${page ? `${page}${page === 'meta' ? '' : '/'}` : ''}`;
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const p = text => `<p>${esc(text)}</p>`;
const email = '<a href="mailto:marco@marcomc.com">marco@marcomc.com</a>';
const artwork = `<div class="app-art"><img class="hero-icon" src="/media/app-icon.png" width="1024" height="1024" alt="" fetchpriority="high"><p>HoMyDash!</p></div>`;
const gallery = lang => `<section class="gallery" id="screenshots"><h2>${esc(media[lang].label)}</h2><div class="screens"><figure><img src="/media/clip-player.png" width="1290" height="2796" alt="${esc(media[lang].player)}" loading="lazy"><figcaption>${esc(media[lang].player)}</figcaption></figure><figure><img src="/media/app-guidance.png" width="1124" height="2436" alt="${esc(media[lang].guidance)}" loading="lazy"><figcaption>${esc(media[lang].guidance)}</figcaption></figure></div><p class="caption">${esc(media[lang].caption)}</p></section>`;
const indexable = process.env.SITE_INDEXABLE === '1';

function body(c, lang, page) {
  if (!page) return `<section class="hero" id="product"><div><p class="eyebrow">${esc(c.development)}</p><h1 itemprop="name">${esc(c.title)}</h1><p class="lead">${esc(c.intro)}</p><a class="button" href="${route(lang, 'support')}">${esc(c.action)} <span aria-hidden="true">↗</span></a></div>${artwork}</section><aside class="notice">${esc(c.status)}</aside><section class="flow" id="workflow"><h2>${esc(c.workflow)}</h2><ol class="steps">${c.steps.map(([title, text], i) => `<li><span class="number" aria-hidden="true">0${i + 1}</span><h3>${esc(title)}</h3>${p(text)}</li>`).join('')}</ol></section><section class="scope" id="scope"><h2>${esc(c.scopeTitle)}</h2><div>${p(c.scope)}${p(c.limits)}</div></section>${gallery(lang)}`;
  if (page === 'support') return `<section class="page-heading"><p class="eyebrow">${esc(c.nav[1])}</p><h1 itemprop="name">${esc(c.supportTitle)}</h1><p class="lead">${esc(c.supportIntro)}</p></section><div class="reading">${c.help.map(([title, text], i) => `<section id="${['before-recording','during-recording','exports','recovery'][i]}"><h2>${esc(title)}</h2>${p(text)}</section>`).join('')}<section class="contact" id="contact"><h2>${esc(c.contact)}</h2>${p(c.contactText)}${p(c.sensitive)}${email}</section></div>`;
  if (page === 'privacy') return `<section class="page-heading"><p class="eyebrow">${esc(c.nav[2])}</p><h1 itemprop="name">${esc(c.privacyTitle)}</h1></section><div class="reading"><aside class="notice"><h2>${esc(c.privacyStatus)}</h2>${p(c.privacyIntro)}</aside>${p(c.privacyBody)}<section><h2>${esc(c.siteTitle)}</h2>${p(c.siteBody)}</section><section>${p(c.privacyContact)}${email}</section></div>`;
  return `<section class="page-heading"><p class="eyebrow">HoMyDash!</p><h1 itemprop="name">${esc(page === 'meta' ? c.metaTitle : c.missing)}</h1><p class="lead">${esc(page === 'meta' ? c.metaBody : c.missingBody)}</p><a class="button" href="${route(lang, 'support')}">${esc(c.nav[1])}</a></section>`;
}
function html(lang, page) {
  const c = content[lang];
  const title = page === 'support' ? c.nav[1] : page === 'privacy' ? c.privacyTitle : page === 'meta' ? c.metaTitle : page === '404' ? c.missing : c.title;
  const url = origin + route(lang, page);
  return `<!doctype html>
<html lang="${languages[lang][1]}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} · HoMyDash!</title><meta name="description" content="${esc(c.description)}"><meta name="robots" content="${indexable && ['', 'support'].includes(page) ? 'index, follow' : 'noindex, follow'}"><meta name="referrer" content="no-referrer">${page !== '404' ? `<link rel="canonical" href="${url}">` : ''}${Object.entries(languages).map(([key, [, tag]]) => `<link rel="alternate" hreflang="${tag}" href="${origin + route(key, page === '404' ? '' : page)}">`).join('')}<link rel="alternate" hreflang="x-default" href="${origin + route('en', page === '404' ? '' : page)}"><meta property="og:title" content="${esc(title)} · HoMyDash!"><meta property="og:description" content="${esc(c.description)}"><meta property="og:image" content="${origin}/media/app-icon.png"><meta property="og:image:alt" content="HoMyDash! app icon"><meta name="twitter:card" content="summary"><meta property="og:type" content="website"><meta property="og:url" content="${url}"><link rel="icon" href="/media/app-icon.png" type="image/png"><link rel="apple-touch-icon" href="/media/app-icon.png"><link rel="stylesheet" href="/style.css"></head>
<body itemscope itemtype="https://schema.org/WebPage"><a class="skip" href="#main">${esc(c.skip)}</a><header class="site-header wrap"><a class="brand" href="${route(lang)}" aria-label="HoMyDash! — ${esc(c.nav[0])}"><img class="brand-icon" src="/media/app-icon.png" width="36" height="36" alt="">HoMyDash!</a><nav aria-label="${esc(c.nav[0])}">${['', 'support', 'privacy'].map((key, i) => `<a href="${route(lang, key)}"${key === page ? ' aria-current="page"' : ''}>${esc(c.nav[i])}</a>`).join('')}</nav><details class="languages"><summary>${esc(c.language)} <span aria-hidden="true">⌄</span></summary><ul>${Object.entries(languages).map(([key, [name, tag]]) => `<li><a href="${route(key, page === '404' ? '' : page)}" lang="${tag}" hreflang="${tag}"${key === lang ? ' aria-current="true"' : ''}>${name}</a></li>`).join('')}</ul></details></header><main class="wrap" id="main" tabindex="-1">${body(c, lang, page)}</main><footer class="wrap" itemprop="author" itemscope itemtype="https://schema.org/Person"><meta itemprop="name" content="Marco Massari Calderone"><p>${esc(c.footer)}</p><a href="${route(lang, 'privacy')}">${esc(c.nav[2])}</a><a href="mailto:marco@marcomc.com">marco@marcomc.com</a></footer></body></html>\n`;
}
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await cp(new URL('../public/', import.meta.url), new URL('../dist/', import.meta.url), { recursive: true });
for (const lang of Object.keys(languages)) for (const page of ['', 'support', 'privacy', 'meta']) {
  const dir = new URL(`../dist${route(lang, page).replace(/\/$/, '')}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), html(lang, page));
}
await writeFile(new URL('../dist/404.html', import.meta.url), html('en', '404'));
await writeFile(new URL('../dist/robots.txt', import.meta.url), `User-agent: *\n${indexable ? 'Allow: /' : 'Disallow: /'}\nSitemap: ${origin}/sitemap.xml\n`);
const urls = Object.keys(languages).flatMap(lang => ['', 'support'].map(page => origin + route(lang, page)));
await writeFile(new URL('../dist/sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>\n`);
const headers = await (await import('node:fs/promises')).readFile(new URL('../dist/_headers', import.meta.url), 'utf8');
await writeFile(new URL('../dist/_headers', import.meta.url), headers.replace('  X-Robots-Tag: noindex, nofollow', indexable ? '' : '  X-Robots-Tag: noindex, follow') + Object.keys(languages).flatMap(lang => ['privacy', 'meta'].map(page => `${route(lang,page)}\n  X-Robots-Tag: noindex, follow\n`)).join(''));
console.log(`Built 20 localized pages, 404, sitemap and static assets. Indexable home/support: ${indexable}.`);
