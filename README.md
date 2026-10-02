# Fixin’ 2 Flyin’

Static website for Dom’s mobile bike repair, trail preparation, coaching, and ride-support brand.

## October 2026 clean rebuild

This rebuild intentionally replaces the previous layered hero/PWA experiments with one maintainable HTML/CSS/JS system.

### Design direction
- black editorial base
- gold primary action color
- purple and cyan supporting accents
- real Dom/Lumi photography
- split-screen Colorado hero
- business/service content before lifestyle and soundtrack
- large condensed typography without text covering the rider

### Technical direction
- single production stylesheet
- no service worker or cache-first CSS
- versioned CSS/JS URLs during transition
- legacy Fixin’ 2 Flyin’ cache cleanup in script.js
- responsive navigation with keyboard Escape support
- accessible gallery dialog/focus return
- service-request form prepares an email to dom@fixin2flyin.com
- automated Playwright responsive and accessibility checks
- Cloudflare Workers deployment from main

Production should only be updated after the rebuild preview has been reviewed and approved.
