# Fixin 2 Flyin — CSS Cheat Sheet

Edit `styles.css`, then save and push.

## Colors (all in :root at the top)
- Purple: `#7d2bff`
- Hot purple: `#a855ff`
- Soft purple: `#c7a6ff`
- Gold: `#d4a74c`
- Soft gold: `#f6dd91`
- Cream/white: `#fff8ea`
- Black: `#020104`
- Line color: `rgba(240, 213, 139, 0.22)`

Change any of these to update that color everywhere it’s used.

## Spacing
- `margin-bottom: 2rem` — space below header (currently `2rem`)
- `gap: clamp(4rem, 8vw, 8rem)` — space between hero columns
- `padding: clamp(5rem, 9vw, 7.6rem) 0 3.6rem` — hero top/side/bottom padding
- `padding: clamp(3rem, 6vw, 5rem) 0` — smaller section padding (`.section-pad-sm`)

## Sizes
- `.brand-logo-full { width: clamp(140px, 18vw, 220px); }` — logo size
- `.nav-menu { font-size: 1rem; }` — nav text size
- `h1 { font-size: clamp(3.8rem, 10vw, 9.6rem); }` — main headline size

## Hero text columns
- `.hero-split { grid-template-columns: 1.35fr 0.65fr; }` — left vs right width
- `.hero-copy { max-width: 760px; }` — left column max width

## Motion strip (bottom bar)
- Change the 7 `<span>` items in `index.html` under `.hero-bottom-strip`
- Reverse direction: `translateX(-220px)` → `translateX(0)` in `@keyframes marquee`

## Text shadow / readability on dark background
`.hero-lede { text-shadow: 0 1px 0 rgba(0,0,0,0.55); }`

## Buttons
- `.button.primary` — gold gradient, black text
- `.button.secondary` — dark with white border
- `.button.ghost` — transparent with gold border

## No more blue
If you see `var(--blue)` or `#1397d4`, delete it — we removed the blue variable.
