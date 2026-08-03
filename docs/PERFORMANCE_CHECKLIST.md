Phase 1 baseline performance checklist

Before opening PR:
- Paste head + hero snippets into index.html (README_MANUAL_INDEX_CHANGES.md)
- Run npm ci
- Run npm run images:generate (if you have originals)
- Serve locally: npx http-server -p 8080
- Run npm run validate
- Run npm run test:lighthouse (informational)
- Run any pa11y/axe checks and resolve errors
- Ensure hero is AVIF/WebP/JPEG in production and placeholders are only in development
- Ensure all non-hero images have loading="lazy" and width/height attributes