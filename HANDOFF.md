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
- Analytics carries `gtag('js')` and `gtag('config')` only. No form data reaches
  analytics, and there is no conversion tracking.
- `scripts/build-blog.js` regenerates the cards in `blog/index.html` and emits
  `class="article-card sr"`, so template changes must be mirrored there.

## Validation

- `node tools/check-build-blog.js` — 19 checks covering slug sanitisation,
  output-path containment, and HTML escaping in the blog generator.
- Keep every page's `<title>` and `<h1>` distinct; two pages shared an `<h1>`
  once and it had to be caught manually.

## Known open items

- Skip links and `<main>` landmarks exist on the three main pages but not on the
  blog pages or 404.
- The newsletter form on blog pages is a native POST, so subscribing navigates
  the reader off-site. The audit and workshop forms submit inline.
- The nav wraps to two lines between roughly 880px and 960px.
- `vercel.json` sets a Content-Security-Policy in report-only mode. It has never
  been observed on a live response and should be verified before being enforced.
