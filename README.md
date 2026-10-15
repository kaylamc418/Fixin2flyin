# Fixin’ 2 Flyin’

October 2026 clean rebuild for the Fixin’ 2 Flyin’ mobile bike repair + bike coaching website.

## Final direction

- Main brand: Fixin’ 2 Flyin’
- Subtitle: Mobile Bike Repair + Bike Coaching
- Visual system: blackout luxury — black, charcoal, deep purple, gold
- Customer flow: Hero → Services → Built Around Motion → Van Life → Dom + Lumi → Mama Tribute → Gallery → Book Dom → Soundtrack → Closing brand statement
- Primary logo: gold F2F wingmark
- Secondary mark: simple pharaoh/MTB icon used selectively
- Closing line: Built to Fix. Ready to Fly.
- Supporting line: From fixin’ 2 ride-ready.

## Technical notes

- Static HTML/CSS/JavaScript
- No service worker; legacy workers/caches are cleaned up client-side
- Responsive navigation and accessibility checks
- Book Dom form prepares a complete request in the visitor’s email app
- Peak Bound soundtrack is user-initiated and includes native audio controls as a fallback
- Production deployment is handled through Cloudflare Workers from `main`

## QA requirements

Before production deployment, verify:

- no climbing / climbs / long climbs wording
- no “Ride Hard. Live Free.” wording
- Book Dom includes preferred date and preferred time
- Van Life is visible
- Mama Tribute uses final approved wording
- primary navigation stays customer-focused
- soundtrack remains lower in the page flow
- main brand stays Fixin’ 2 Flyin’
- subtitle stays Mobile Bike Repair + Bike Coaching
- mobile layout and booking form remain usable
- no broken links, duplicate sections, or placeholder contact details
