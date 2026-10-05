import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const COMPACT_NAV_MAX_WIDTH = 1040;

const viewports = [
  { name: 'Mobile 320', width: 320, height: 700 },
  { name: 'Mobile 360', width: 360, height: 800 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 430', width: 430, height: 932 },
  { name: 'Tablet 700', width: 700, height: 900 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Tablet 820', width: 820, height: 900 },
  { name: 'Desktop boundary 821', width: 821, height: 900 },
  { name: 'Compact nav 1040', width: 1040, height: 900 },
  { name: 'Full nav 1041', width: 1041, height: 900 },
  { name: 'Desktop 1280', width: 1280, height: 900 },
  { name: 'Desktop 1440', width: 1440, height: 900 }
];

for (const viewport of viewports) {
  test(`rebuilt homepage is stable on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const header = page.locator('[data-testid="site-header"]');
    const hero = page.locator('[data-testid="hero-section"]');
    const title = page.locator('[data-testid="hero-title"]');
    const heroImage = hero.locator('.hero-photo img');
    const heroPanel = hero.locator('.hero-panel');
    const services = page.locator('#services');
    const soundtrack = page.locator('[data-testid="music-section"]');

    await expect(header).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(title).toBeVisible();
    await expect(heroImage).toBeVisible();
    await expect(services).toBeVisible();
    await expect(soundtrack).toBeVisible();

    await expect(title).toContainText(/built to fix\.\s*ready to fly\./i);
    await expect(hero).toContainText(/mobile bike repair/i);
    await expect(hero.getByRole('link', { name: 'Request Service', exact: true })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Explore Coaching', exact: true })).toBeVisible();
    await expect(hero.locator('[data-testid="hero-actions"] a')).toHaveCount(2);

    const imageInfo = await heroImage.evaluate((img) => ({
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loading: img.getAttribute('loading')
    }));
    expect(imageInfo.complete).toBe(true);
    expect(imageInfo.naturalWidth).toBeGreaterThan(0);
    expect(imageInfo.naturalHeight).toBeGreaterThan(0);
    expect(imageInfo.loading).toBeNull();

    const [heroBox, photoBox, panelBox] = await Promise.all([
      hero.boundingBox(),
      hero.locator('.hero-photo').boundingBox(),
      heroPanel.boundingBox()
    ]);
    expect(heroBox).not.toBeNull();
    expect(photoBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    if (!heroBox || !photoBox || !panelBox) throw new Error('Hero geometry unavailable');

    if (viewport.width > 820) {
      expect(photoBox.x + photoBox.width).toBeLessThanOrEqual(panelBox.x + 1);
      expect(photoBox.height).toBeGreaterThanOrEqual(heroBox.height - 2);
      expect(panelBox.height).toBeGreaterThanOrEqual(heroBox.height - 2);
    } else {
      expect(photoBox.y + photoBox.height).toBeLessThanOrEqual(panelBox.y + 1);
      expect(photoBox.width).toBeLessThanOrEqual(heroBox.width + 1);
      expect(panelBox.width).toBeLessThanOrEqual(heroBox.width + 1);
    }

    const orderIsCorrect = await page.evaluate(() => {
      const heroEl = document.querySelector('[data-testid="hero-section"]');
      const servicesEl = document.querySelector('#services');
      const soundtrackEl = document.querySelector('[data-testid="music-section"]');
      if (!heroEl || !servicesEl || !soundtrackEl) return false;
      return Boolean(
        (heroEl.compareDocumentPosition(servicesEl) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (servicesEl.compareDocumentPosition(soundtrackEl) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });
    expect(orderIsCorrect).toBe(true);

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    );
    expect(noHorizontalOverflow).toBe(true);

    if (viewport.width > COMPACT_NAV_MAX_WIDTH) {
      for (const label of ['Services', 'Coaching', 'About', 'Gallery', 'Contact', 'Book Service']) {
        await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
      await expect(header.getByRole('button', { name: /open navigation/i })).toBeHidden();
    } else {
      await expect(header.getByRole('button', { name: /open navigation/i })).toBeVisible();
    }
  });
}