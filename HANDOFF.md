# Handoff

Technical notes for whoever works on this next.

## Deployment

Production deploys come from `main` via Vercel.

**Deployments broke on 2026-09-11 while the repository was temporarily
private.** Vercel returned "Deployment was blocked" before running any build,
and the project would have needed a paid plan to authorise the pushing account.
Making the repository public again restored deploys. If this recurs, check
repository visibility first — the code is not the cause.

Ruled out during that diagnosis, so it need not be re-investigated: the Vercel
GitHub App grant, `vercel.json`, and commit-author attribution. A branch push
builds a preview and is a safe way to confirm Vercel is responding.

## Structure

- `index.html`, `workshops.html` and `services.html` each carry their own copy
  of the same `<style>` block. Any CSS change must be applied to all three, or
  extracted into a shared stylesheet.
- `site-accessibility.css` and `site-ui.js` are shared across pages. The
  accessibility stylesheet must load *after* each page's inline `<style>`, or
  its `.sr` rule loses the cascade and scroll-reveal content stays invisible
  without JavaScript.
- All forms post to the same Formspree endpoint, separated only by `_subject`.
- Analytics carries `gtag('js')`, `gtag('config')`, and one `generate_lead` event
  fired after a successful form submission, with a `form_name` of
  `operations_audit`, `workshop_updates`, or `newsletter`. No form field values
  reach analytics. Mark `generate_lead` as a key event in GA4 to report on it.
- `privacy.html` describes the forms, analytics, and third parties. Update it when
  you add a tool that collects or receives visitor data, and link it from every
  footer (the blog footer comes from `blog/_template.html`).
- `scripts/build-blog.js` regenerates the cards in `blog/index.html` and emits
  `class="article-card sr"`, so template changes must be mirrored there.

## Validation

- `node tools/check-build-blog.js` — 19 checks covering slug sanitisation,
  output-path containment, and HTML escaping in the blog generator.
- Keep every page's `<title>` and `<h1>` distinct; two pages shared an `<h1>`
  once and it had to be caught manually.

## Security headers

`vercel.json` sets the response headers, including a **Content-Security-Policy
that is enforced**, not report-only, as of 2026-09-30.

Before enforcing it, every page was loaded in headless Chromium against a local
server sending the exact policy, and produced no violations. The detector was
proved to fire first by planting script, stylesheet, image and object
violations. The third-party origins the site needs (fonts.googleapis.com,
fonts.gstatic.com, googletagmanager.com, google-analytics.com, `data:` images)
were each confirmed to pass the allowlist.

The policy carries **no `report-uri` or `report-to`**, so violations surface only
in the visitor's console and are not collected anywhere. If you add third-party
embeds, widgets, or a tag manager container that injects new origins, they will
be blocked silently from the site's point of view. Add the origin to the matching
directive when you add the tool.

One known blind spot: if Google Signals or ads features are enabled on the GA4
property, GA can beacon to `stats.g.doubleclick.net` and `*.analytics.google.com`,
which are not in `connect-src`. Core analytics (`google-analytics.com`,
`region1.google-analytics.com`) is covered. If analytics volume drops after
enforcement, add those origins to `connect-src` rather than assuming the tag
broke.

To roll back, rename the header key to `Content-Security-Policy-Report-Only`.

## Known open items

- None outstanding. The previous entries (skip links and `<main>` on blog pages
  and 404, the blog newsletter posting natively off-site, nav wrapping between
  880px and 960px, and the unverified CSP) have all been resolved and verified.
