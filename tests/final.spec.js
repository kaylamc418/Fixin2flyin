import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';

const viewports = [
  { name: 'Mobile 355', width: 355, height: 768 },
  { name: 'Mobile 360', width: 360, height: 800 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 430', width: 430, height: 932 },
  { name: 'Mobile boundary 699', width: 699, height: 900 },
  { name: 'Tablet boundary 700', width: 700, height: 900 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Tablet boundary 979', width: 979, height: 900 },
  { name: 'Desktop boundary 980', width: 980, height: 900 },
  { name: 'Desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`cinematic hero remains stable on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const header = page.locator('[data-testid="site-header"]');
    const hero = page.locator('[data-testid="hero-section"]');
    const title = page.locator('[data-testid="hero-title"]');
    const left = title.locator('.f2f-title-left');
    const right = title.locator('.f2f-title-right');
    const heroImage = hero.locator('.f2f-hero-media img');
    const music = page.locator('[data-testid="music-section"]');

    await expect(header).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(title).toBeVisible();
    await expect(left).toBeVisible();
    await expect(right).toBeVisible();
    await expect(heroImage).toBeVisible();
    await expect(music).toBeVisible();

    const correctOrder = await page.evaluate(() => {
      const h = document.querySelector('[data-testid="site-header"]');
      const heroElement = document.querySelector('[data-testid="hero-section"]');
      const musicElement = document.querySelector('[data-testid="music-section"]');
      if (!h || !heroElement || !musicElement) return false;
      return Boolean(
        (h.compareDocumentPosition(heroElement) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (heroElement.compareDocumentPosition(musicElement) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });
    expect(correctOrder).toBe(true);

    await expect(title).toContainText(/built\s*to\s*fix\s*ready\s*to\s*fly/i);
    await expect(hero).toContainText(/mobile bike repair/i);
    await expect(hero).toContainText(/trail prep/i);
    await expect(hero).toContainText(/coaching built for the ride ahead/i);

    await expect(hero.getByRole('link', { name: 'Fix My Rig', exact: true })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'See the Action', exact: true })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Learn to Send', exact: true })).toBeVisible();

    await expect(hero.locator('picture')).toHaveCount(1);
    await expect(heroImage).toHaveAttribute('fetchpriority', 'high');
    const imageInfo = await heroImage.evaluate((img) => ({
      currentSrc: img.currentSrc,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
      loading: img.getAttribute('loading'),
    }));
    expect(imageInfo.complete).toBe(true);
    expect(imageInfo.naturalWidth).toBeGreaterThan(0);
    expect(imageInfo.naturalHeight).toBeGreaterThan(0);
    expect(imageInfo.currentSrc).toMatch(/DOMPROJ\.jpg(?:\?.*)?$/i);
    expect(imageInfo.loading).toBeNull();

    const titleLayout = await title.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        display: styles.display,
        rows: styles.gridTemplateRows,
        columns: styles.gridTemplateColumns,
      };
    });
    expect(titleLayout.display).toBe('grid');
    expect(titleLayout.rows.trim().split(/\s+/)).toHaveLength(1);
    expect(titleLayout.columns.trim().split(/\s+/).length).toBeGreaterThanOrEqual(3);

    const [heroBox, leftBox, rightBox] = await Promise.all([
      hero.boundingBox(),
      left.boundingBox(),
      right.boundingBox(),
    ]);
    expect(heroBox).not.toBeNull();
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();
    if (!heroBox || !leftBox || !rightBox) throw new Error('Hero geometry unavailable');

    expect(Math.abs(leftBox.y - rightBox.y)).toBeLessThanOrEqual(24);
    expect(rightBox.x).toBeGreaterThan(leftBox.x + leftBox.width - 2);

    // Measure rendered word ranges, not just grid cells, so fallback fonts cannot clip off-screen.
    const wordRects = await title.evaluate((element) => {
      const rectFor = (node) => {
        if (!node) return null;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
      };
      return {
        built: rectFor(element.querySelector('.f2f-title-left > span')),
        ready: rectFor(element.querySelector('.f2f-title-right > span')),
      };
    });

    if (viewport.width < 700) {
      expect(wordRects.built).not.toBeNull();
      expect(wordRects.ready).not.toBeNull();
      if (!wordRects.built || !wordRects.ready) throw new Error('Headline word geometry unavailable');

      const safeInset = 6;
      expect(wordRects.built.left).toBeGreaterThanOrEqual(heroBox.x + safeInset);
      expect(wordRects.ready.right).toBeLessThanOrEqual(heroBox.x + heroBox.width - safeInset);
      expect(heroBox.height).toBeLessThanOrEqual(viewport.height * 1.45);
    }

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    );
    expect(noHorizontalOverflow).toBe(true);

    await expect(music).toContainText("Dom’s Original Song");
    await expect(music.getByRole('button', { name: /play dom’s original song/i })).toBeVisible();

    if (viewport.width >= 980) {
      for (const label of ['Soundtrack', 'Dom Code', 'Services', 'Tribute', 'Story', 'Gallery', 'Book Dom']) {
        await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
    } else {
      await expect(header.getByRole('button', { name: /open navigation/i })).toBeVisible();
    }
  });
}
