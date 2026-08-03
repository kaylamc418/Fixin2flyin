Project architecture & contributor guide (Phase 1)

Folders:
- assets/
  - originals/    -> place master photos here (never committed)
  - placeholders/ -> lightweight SVGs used until real photos arrive
  - generated/    -> generated AVIF/WEBP/JPG (ignored from VCS)
- scripts/
  - image-build.js -> generates responsive images from originals
- css/            -> design tokens & component styles
- js/             -> player, marquee, currently-rolling
- pages/          -> Phase 2 scaffolding (coaching, services, ...)

Image pipeline:
- Add masters to assets/originals/
- Run `npm run images:generate` to produce assets/generated/<name>/<name>-<width>.(avif|webp|jpg)
- Use generated files in production; keep placeholders until replaced.

CI & validation:
- CI uses npm ci, npm run validate (lint & a11y), and an informational Lighthouse run.
- Accessibility (pa11y) and broken-link checks are blocking.