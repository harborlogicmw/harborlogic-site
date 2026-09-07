# Harbor Logic — Landing Site

Marketing site for Harbor Logic. Positioning is systems-first and tool-agnostic:
Harbor Logic builds practical operating systems for seasonal businesses around
whatever tools a client already uses.

## Stack

- Static HTML (no framework, no build step for the homepage)
- Formspree for contact form submissions
- Google Analytics (GA4)
- Deployed on Vercel
- Domain: harborlogic.cc

## Files

```
/
├── index.html              # The homepage — the whole marketing site
├── 404.html                # Not-found page (noindex)
├── favicon.ico             # Browser tab icon
├── apple-touch-icon.png    # iOS home screen icon
├── harborlogic-logo.png    # Logo used in the nav and on 404
├── og-image.png            # Social share image (LinkedIn, iMessage, etc.)
├── robots.txt
├── sitemap.xml
├── blog/
│   ├── index.html          # Post index
│   ├── _template.html      # Template used by the blog build script
│   ├── blog.css
│   └── *.html              # Generated posts
└── scripts/
    └── build-blog.js       # Generates blog posts from a Notion database
```

## Making updates

Edit `index.html`, commit to the main branch, Vercel redeploys automatically.

Common edits:

- **Headline or copy**: search for the text you want to change in `index.html`
- **Colors**: CSS variables at the top of the `<style>` block
  - `--ink-deep: #060a12` — page background
  - `--ink: #0b111c` / `--ink-raised: #101826` — section and card backgrounds
  - `--teal: #3bc9b7` — accent (`--teal-soft`, `--teal-deep` are the gradient stops)
  - `--bone: #e6e2d5` — body text (`--bone-dim`, `--bone-muted`, `--bone-faint` are the fades)
  - `--hairline: rgba(230, 226, 213, 0.08)` — dividers and borders
- **Form endpoint**: `<form action="...">` attribute (currently `https://formspree.io/f/mykljkjo`)
- **Analytics**: GA4 tag `G-H0LTB0KNQL`, configured in the `<head>`
- **Sitemap**: update the `<lastmod>` for any page you change in `sitemap.xml`

## Blog

Posts are generated from a Notion database by `scripts/build-blog.js`, which reads
`NOTION_API_KEY` and `NOTION_DATABASE_ID` from the environment. This is an internal
authoring pipeline only — it is not a customer-facing dependency, and the site
itself is plain static HTML.

## Contact

info@harborlogic.cc
