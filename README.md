# HoMyDash! website

Small static product and support site for **HoMyDash!**, an iPhone dashcam app
in development. Intended domain: <https://homydash.marcomc.com>.
Sources are public; GitHub Pages publishes only the generated website artifact.

## Table of contents

- [Development](#development)
- [Content and routes](#content-and-routes)
- [Checks](#checks)
- [Publishing](#publishing)
- [Hosting and app association](#hosting-and-app-association)
- [Search and AI discovery](#search-and-ai-discovery)

## Development

Requires Node.js 22 or later. No dependencies or installation step.
Run from the repository root:

```sh
npm run build
npm run preview
```

Open <http://127.0.0.1:4173>. Preview binds to loopback only. Use `PORT=4174`
for an alternative port. Stop the server with Ctrl-C. `dist/` is disposable.
The preview serves only `dist/`, never source or review material, and does not
log request paths or query strings. Unknown paths return HTTP 404.

## Content and routes

| Page | English | Other locales |
| --- | --- | --- |
| Home | `/` | `/it/`, `/es/`, `/fr/`, `/pt/` |
| Support | `/support/` | `/{locale}/support/` |
| Privacy status | `/privacy/` | `/{locale}/privacy/` |
| Callback fallback | `/meta` | `/{locale}/meta` |

English is the default; Spanish targets Spain and Portuguese targets Portugal.
The native language disclosure preserves the current page without JavaScript.

- `src/content.mjs`: complete localized copy, accessible image descriptions.
- `tools/build.mjs`: HTML, canonical/hreflang, sitemap and indexing modes.
- `public/style.css`: responsive layout and app-derived palette.
- `public/media/`: original app icon and authentic development screenshots.
  Screenshots show an English development interface and synthetic test video;
  they are not a release compatibility claim. Exported metadata was removed.
- `review/`, `output/`: local editorial notes and evidence, ignored by Git.

Privacy is a clearly labelled holding notice. It is not a final app privacy
policy or a statement of regulatory compliance. Review material is excluded
from the generated site. Public contact: <marco@marcomc.com>.

## Checks

```sh
npm run build
npm run check
CHECK_URL=http://127.0.0.1:4173 npm run check
```

The HTTP checks require the preview in another terminal. They check all page
routes, AASA response type, 404/isolation, unsupported methods and callback query
non-reflection. Static checks cover localization keys, links, image existence,
canonical metadata, sitemap scope and unsupported product claims.

Browser evidence is stored locally under `output/playwright/`: 20 pages at
320, 390, 768 and 1440 CSS pixels, keyboard navigation and enlarged text.
It is separate from the source checks. No runtime JavaScript, third-party
fonts, forms, tracking, cookies or browser storage are included.

Run Markdown lint with the operator's configured `markdownlint` configuration
on edited Markdown. No shell scripts are required.

## Publishing

The owner authorised the public source repository `marcomc/homydash-site` and
GitHub Pages on 30 October 2026. `.github/workflows/pages.yml` builds and checks
an indexable artifact on pushes to `main`, uploads only `dist/` (including
`.well-known/`) and deploys it to Pages. Official GitHub Actions are pinned.
Source access is read-only; only the deployment job can write Pages. Local
editorial notes, handoff and evidence remain ignored and are never uploaded.
The earlier generated-only `homydash-pages` repository is no longer used.

The local default remains a noindex preview. To prepare an indexable artifact:

```sh
SITE_INDEXABLE=1 npm run build
SITE_INDEXABLE=1 npm run check
```

Only home and support become indexable. Privacy holding pages, callbacks and
404 stay noindex. Rebuilding without the variable restores preview mode.
Publication does not make the app or its privacy policy release-ready.

## Hosting and app association

Serve generated files over HTTPS. Configure the Pages custom domain as
`homydash.marcomc.com`; the DNS owner manages its CNAME separately. Do not change
the developer's apex site or mail records. Publish only `dist/`, not the repo.

`public/_headers` is a reference for hosts supporting that format. **GitHub
Pages does not apply it.** Response headers must be verified on the real host;
the local preview's headers are not production evidence.

AASA is at `/.well-known/apple-app-site-association`. It contains only
`P73JP6JAPH.com.marcomc.OhMyDash` and the exact `/meta` match. The hostname and
application identifier remain independent of the public brand spelling.
There are no tokens, wildcards or alternate app identifiers.

Before the coordinator enables app integration, verify the actual response:

```sh
curl --silent --show-error --dump-header - \
  https://homydash.marcomc.com/.well-known/apple-app-site-association
curl --silent --show-error --dump-header - \
  https://homydash.marcomc.com/meta
```

AASA must return HTTP 200 directly over valid HTTPS, with
`Content-Type: application/json`, without authentication or redirect. Validate
the response body against the source file. An extensionless JSON file on Pages
may receive a different MIME type: a header-capable front end or separate
hosting treatment is required if the live check fails. Do not call the
association ready until this is resolved and verified. GitHub directory
routing may redirect `/meta` to `/meta/`; a front end should serve the exact
callback path directly if required by the integration.

The callback has no scripts or authentication backend, does not inspect or
reflect parameters, and uses a no-referrer policy. The initial request still
reaches the hosting infrastructure; hosting logs, CDN query handling, HTTPS,
cache policy and redirects need independent verification. Do not use real
codes during tests. Apple/Meta configuration remains the coordinator's work.

## Search and AI discovery

Content is plain server-served HTML with landmarks, descriptive headings,
stable section anchors, explicit language links and no client rendering.
Each language has self-canonical URLs and reciprocal `hreflang`, including
`x-default`. Schema.org WebPage/Person microdata identifies pages and author
without executable scripts, store offers, ratings or unsupported release data.
Open Graph metadata uses the original app icon. Sitemap includes ten home and
support URLs; `llms.txt` is a concise optional reading index, not a guaranteed
AI inclusion or ranking mechanism.

Production indexing still requires a reachable domain and crawlable HTTP
responses. Reconcile any host-level `X-Robots-Tag` before launch. Robots rules
are not access control. The preview stays local and noindex by default.

References: [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions),
[Google robots directives](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag),
[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

The Pages custom domain is `homydash.marcomc.com`. `.nojekyll` is included for
static portability; `.well-known/` is retained in the uploaded artifact.
