Manual index.html edits (one-time; paste these snippets into index.html)

1) Head snippet (replace YOUR_PRODUCTION_URL_HERE with real URL):
--- paste the JSON-LD, OG/Twitter canonical snippet provided in the earlier assistant message here ---
(Use the same snippet from the manual change guidance file you reviewed.)

2) Hero <picture> snippet (replace the current hero image block):
<picture class="hero-media">
  <source type="image/avif" srcset="/assets/hero/hero-colorado-jump.avif" sizes="100vw">
  <source type="image/webp" srcset="/assets/hero/hero-colorado-jump.webp" sizes="100vw">
  <img src="/assets/placeholders/hero.svg" alt="Dom performing a Colorado flag jump at golden hour" width="1600" height="900" fetchpriority="high" loading="eager" decoding="async">
</picture>

3) After pasting, visually confirm the hero poster loads and meta tags appear in page source.