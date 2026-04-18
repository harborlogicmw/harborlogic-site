# Harbor Logic — Landing Site

Single-page marketing site for Harbor Logic hospitality consultancy.

## Stack

- Static HTML (no framework, no build step)
- Formspree for contact form submissions
- Deployed on Vercel
- Domain: harborlogic.cc

## Files

```
/
├── index.html              # The whole site
├── shield-mark.jpg         # Logo used in the hero
├── favicon.ico             # Browser tab icon
├── apple-touch-icon.png    # iOS home screen icon
├── og-image.png            # Social share image (LinkedIn, iMessage, etc.)
└── README.md
```

## Making updates

Edit `index.html`, commit to main branch, Vercel redeploys automatically.

Common edits:
- **Headline or copy**: search for the text you want to change in `index.html`
- **Colors**: CSS variables at the top of the `<style>` block
  - `--navy: #1a2332` — primary dark (page background)
  - `--teal: #2a9d8f` — accent
  - `--cream: #f4efe4` — form card and about section
- **Form endpoint**: `<form action="...">` attribute (currently `https://formspree.io/f/mykljkjo`)

## Contact

mwilson@harborlogic.cc
