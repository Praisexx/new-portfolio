# Chukwudi Praise — Portfolio

Personal portfolio for **Chukwudi Praise**, Frontend Engineer (React · Next.js · TypeScript).

A single-page site with anchored navigation. No framework, no build step, no dependencies
to install.

## Structure

```
index.html            entire site — Home, Experience, Impact, Skills, Process, About, Contact
assets/css/main.css   hand-authored stylesheet (design tokens + components)
assets/js/main.js     ~2 KB: mobile nav, scroll spy, reveal-on-scroll
```

## Running locally

Any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works.

## Deploying

Static hosting — GitHub Pages, Netlify, Vercel, Cloudflare Pages. No build command,
no output directory. Publish the repository root.

## Notes

- **No CSS framework.** The previous version loaded the Tailwind Play CDN, which ships
  ~400 KB and compiles styles in the browser on every page load. It was replaced with a
  single hand-written stylesheet.
- **One external request:** the Inter webfont from Google Fonts, preconnected and loaded
  with `font-display: swap`. Everything else is local.
- **Confidentiality.** Client, product and project names from professional work are
  deliberately not published. Sections describe capability and contribution instead.
- **The résumé PDF is intentionally not linked** from the site.
- **No contact form**, so no form endpoint is exposed in the markup. Contact is a
  `mailto:` link.

## Accessibility & performance

Semantic landmarks, skip link, keyboard-operable navigation with `aria-expanded` /
`aria-current`, visible focus states, and `prefers-reduced-motion` support for both
smooth scrolling and reveal animations. The page renders fully with JavaScript disabled.
