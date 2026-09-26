import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';
const COMPACT_NAV_MAX_WIDTH = 1040;

const viewports = [
  { name: 'Mobile 320', width: 320, height: 700 },
  { name: 'Mobile 345', width: 345, height: 760 },
  { name: 'Mobile 355', width: 355, height: 768 },
  { name: 'Mobile 360', width: 360, height: 800 },
  { name: 'Mobile 375', width: 375, height: 812 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 430', width: 430, height: 932 },
  { name: 'Mobile boundary 699', width: 699, height: 900 },
  { name: 'Tablet boundary 700', width: 700, height: 900 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Tablet boundary 979', width: 979, height: 900 },
  { name: 'Desktop boundary 980', width: 980, height: 900 },
  { name: 'Compact-nav boundary 1040', width: 1040, height: 900 },
  { name: 'Full-nav boundary 1041', width: 1041, height: 900 },
  { name: 'Desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`cinematic hero remains stable on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const header = page.locator('[data-testid="site-header"]');
    const hero = page.locator('[data-testid="hero-section"]');
    const title = page.locator('[data-testid="hero-title"]');
    const titleLines = title.locator('.f2f-title-line');
    const heroImage = hero.locator('.f2f-hero-media img');
    const music = page.locator('[data-testid="music-section"]');

    await expect(header).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(title).toBeVisible();
    await expect(titleLines).toHaveCount(2);
    await expect(titleLines.first()).toBeVisible();
    await expect(titleLines.nth(1)).toBeVisible();
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
    await expect(hero).toContainText(/one-on-one coaching/i);
    await expect(hero).toContainText(/keep your bike dialed and your riding confident/i);

    await expect(hero.getByRole('link', { name: 'Request Service', exact: true })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Explore Coaching', exact: true })).toBeVisible();
    await expect(hero.locator('[data-testid="hero-actions"] a')).toHaveCount(2);

    await expect(hero.locator('picture')).toHaveCount(1);
    await expect(hero.locator('picture source')).toHaveCount(3);
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

    const expectedHeroAsset = viewport.width < 700
      ? /hero-mobile\.webp(?:\?.*)?$/i
      : viewport.width < 980
        ? /hero-tablet\.webp(?:\?.*)?$/i
        : /hero-desktop\.webp(?:\?.*)?$/i;
    expect(imageInfo.currentSrc).toMatch(expectedHeroAsset);
    expect(imageInfo.loading).toBeNull();

    const [heroBox, titleBox, contentBox] = await Promise.all([
      hero.boundingBox(),
      title.boundingBox(),
      hero.locator('.f2f-hero-content').boundingBox(),
    ]);
    expect(heroBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    if (!heroBox || !titleBox || !contentBox) throw new Error('Hero geometry unavailable');

    expect(titleBox.y).toBeGreaterThan(heroBox.y + heroBox.height * 0.42);
    expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height + 2);

    if (viewport.width >= 700) {
      expect(contentBox.x).toBeLessThan(heroBox.x + heroBox.width * 0.5);
      expect(contentBox.width).toBeLessThan(heroBox.width * 0.72);
    } else {
      expect(contentBox.width).toBeLessThanOrEqual(heroBox.width);
      expect(heroBox.height).toBeLessThanOrEqual(viewport.height * 1.5);
    }

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    );
    expect(noHorizontalOverflow).toBe(true);

    await expect(music).toContainText("Dom’s Original Song");
    await expect(music.getByRole('button', { name: /play peak bound/i })).toBeVisible();

    if (viewport.width > COMPACT_NAV_MAX_WIDTH) {
      for (const label of ['Soundtrack', 'Dom Code', 'Services', 'Tribute', 'Story', 'Gallery', 'Book Dom']) {
        await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
      await expect(header.getByRole('button', { name: /open navigation/i })).toBeHidden();
    } else {
      await expect(header.getByRole('button', { name: /open navigation/i })).toBeVisible();
    }
  });
}
