# Glacier Skating — Website

A clean, flat-colour single-page marketing site for **Glacier Skating**, an indoor ice skating rink.

Built with plain **HTML + CSS + JavaScript** — no frameworks, no build step, no dependencies. Open it or host it anywhere.

## Highlights

- **Flat, icy design system** — brand colours pulled straight from the logo (`#0090B4` / `#3AC4E6` on deep navy)
- **Canvas snowfall** in the hero (pauses off-screen & on hidden tabs)
- **Masked headline entrance**, staggered scroll reveals, animated stat counters
- **Infinite marquee** ticker, hover-tilt 3D cards, grayscale-to-colour gallery
- **Subtle parallax** on hero background and image collage
- **Custom cursor** (dot + trailing ring, desktop only)
- **Live "Open now / Closed" chip** and today's hours highlighting, computed from the hours table in JS
- Fully responsive, keyboard-friendly, and respects `prefers-reduced-motion`

## Run locally

Any static server works, e.g.:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:8000 (or http://127.0.0.1:8000).

## Structure

```
index.html            # the whole site
favicon.svg
assets/
  css/style.css       # design system + all animations
  js/main.js          # snow, reveals, counters, tilt, cursor, hours, form
  img/                # optimised WebP photos + logo PNGs
```

## Editing content

All content is placeholder and lives in `index.html`:

- **Prices** — the `.prices__grid` section
- **Opening hours** — the `#hoursTable` rows **and** the `hours` map in `assets/js/main.js` (they must match)
- **Address / phone / email** — the Visit section, footer, and the `mailto:` in `main.js`
- **Images** — swap files in `assets/img/` (keep the same names, or update `src` paths)

## Deploying

GitHub Pages: Settings → Pages → deploy from the `main` branch root. No build step needed.
