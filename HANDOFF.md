# Handoff — 2026-09-11

## Codex integration update

Work continues on `codex/integrate-claude-handoff`, based on Claude's `3141634`.
The original local Codex branch remains intact. Nothing has been merged to main
or deployed by this integration pass.

- Preserved Claude's year-round positioning, Services page, founding pricing,
  blog-generation security fixes, and report-only security headers.
- Reimplemented shared keyboard navigation, Escape/focus handling, content
  visibility, reduced-motion support, and no-JavaScript navigation fallback
  across homepage, Services, workshops, and blog/template pages.
- Added full main landmarks and skip links to the three main pages.
- Preserved the owner's requested open panel treatment: removed the prominent
  blue-gray surfaces, heavy shadows, and enclosing borders. The earlier claim
  below that `30b8c2e` was superseded is incorrect: the Claude branch still had
  those surfaces, and `f9c2aa9` predates the owner's subsequent visual request.
- Standardized main-page audit CTAs as requests; retained response timing and
  email recovery copy without reverting Claude's newer business positioning.

Validation: all 19 blog security checks pass. Remaining integration checks are
JavaScript syntax, shared asset references, and Git whitespace checks. This
focused pass has not repeated the earlier browser checks against the newly
integrated pages; responsive and keyboard browser verification remains needed.

Next: browser QA (especially Services, no-JavaScript/reduced-motion, and the
880–960px nav range), newsletter inline submission, blog landmarks/headings,
then shared stylesheet extraction. Provider delivery/spam and deployed security
headers still need verification. Do not enforce CSP or change repo visibility
based solely on these notes. Reconcile and review before merging/deployment.

The original Claude handoff below is retained as historical context; its
instructions to reset/drop local work and its completed-work inventory are
superseded by this update.

State of `claude/harbor-logic-systems-first-usg53e` at `2593fae`, for whoever
picks this up next.

## Where things stand

Six commits on the branch. **`main` is untouched at `ab9bfd0` and nothing here
is deployed.** harborlogic.cc is still serving the pre-September-11 site.

| commit | what |
|---|---|
| `c8a9612` | `scripts/build-blog.js`: path traversal + HTML injection fixes, plus `tools/check-build-blog.js` (19 checks) |
| `dbc93fa` | `vercel.json`: security headers; CSP is **report-only** and has never been observed on a live response |
| `02e42a1` | `services.html` — the broader consultancy offer |
| `f2719c9` | nav `Process` → `Services` on all 8 pages, firm-first title, Harbor OS demote clause, sitemap |
| `076c0f3` | homepage title broadened |
| `2593fae` | year-round homepage copy |

## Positioning, so copy edits don't undo it

Harbor Logic is the firm; **Harbor OS is one offer, not the company.** The
homepage now speaks to any local business (owner dependency, not seasonality).
Harbor OS keeps its seasonal language *on purpose* — the offer section labels it
as the build done most often for seasonal operators, which makes "built in your
off-season, live by opening day" accurate rather than a claim about the whole
company. Ten seasonal passages remain for that reason, plus the About history.

Pricing is founding-rate framed: Build `$5,000` now / `$9,000` after the first
three builds, Partner `$1,000` / `$1,800`, Blueprint `$1,500` credited toward a
Build. Do not quietly normalise these to single numbers.

`index.html` and `services.html` drifted into sharing an `<h1>` once and it was
caught. Keep every page's `<title>` and `<h1>` distinct.

## For `codex/site-audit-first-pass`

That branch was never pushed, so it has not been reconciled. **Do not rebase it
commit by commit.**

- `30b8c2e` (panel fills, gradients, shadows, borders) is **superseded** by
  `f9c2aa9` on main, which replaced the card treatment with a typographic one.
  Re-applying it will fight the current design. Drop it.
- `6a8d5b6` still has unique value, but only one part: making content visible
  without scroll-reveal JavaScript. The homepage it was written against has
  since been rewritten — hero, problem section, comparison columns, offer
  framing, audit naming — so **re-implement that fix against current code**
  rather than merging the commit.

Suggested: reset the branch onto `claude/harbor-logic-systems-first-usg53e` and
redo the one fix that matters.

## Open work, in priority order

1. **Merge.** Six commits, nothing live.
2. **Content invisible without JavaScript.** 51 elements sit at `opacity: 0`
   until an IntersectionObserver adds `.visible` — 24 in `index.html`, 10 in
   `services.html`, 8 in `workshops.html`, 5 in `blog/index.html`, 4 in
   `blog/_template.html`. No `<noscript>` fallback and no
   `prefers-reduced-motion` handling anywhere. If that script fails, most of the
   site is blank. This is the highest-value fix outstanding.
3. **Newsletter form** is a native POST on all 5 blog files, so subscribing
   navigates the reader to Formspree's own page. The audit and workshop forms
   stay on-page; the handler exists twice already and needs copying with new IDs.
4. **Nav wraps at ~900px** — "Harbor OS" and the CTA each break to two lines
   between the 880px breakpoint and roughly 960px. Pre-existing, cosmetic.
5. **The GitHub repo is public**, and "Mission Point" remains reachable in old
   commit history. Making it private closes that; the name is gone from all
   current files.

## Constraints worth knowing

- `index.html`, `workshops.html` and `services.html` carry **byte-identical
  ~34KB `<style>` blocks**, and nav and footer markup live in all three. Any CSS
  change must be applied to all three. At three copies, extracting a shared
  stylesheet starts to pay for itself — but it would make the codex
  reconciliation harder, so it should come after.
- All three forms post to the **same Formspree endpoint**, separated only by
  `_subject`. Per-flow spam and notification settings therefore cannot be tuned.
- Analytics carries `gtag('js')` and `gtag('config')` only. **No form data ever
  reaches analytics** — verified. It also means there is no conversion tracking.
- `scripts/build-blog.js` regenerates `blog/index.html` cards and emits
  `class="article-card sr"`, so it will reintroduce the `.sr` dependency in item
  2 unless the template is fixed too.

## Needs the owner

- Prices for the three non-Harbor-OS service lines (`services.html` currently
  says they are scoped at the audit — deliberately, not as a placeholder).
- A real SOP excerpt or scorecard sample; nothing on the site shows the actual
  deliverable.
- Formspree account access for spam, delivery and duplicate-submission checks.
- Vercel dashboard to confirm headers and later promote the CSP out of
  report-only.
