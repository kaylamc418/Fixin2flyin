import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';
const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`cinematic homepage works on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const header = page.locator('[data-testid="site-header"]');
    const hero = page.locator('[data-testid="hero-section"]');
    const music = page.locator('[data-testid="music-section"]');

    await expect(header).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(music).toBeVisible();

    const correctOrder = await page.evaluate(() => {
      const h = document.querySelector('[data-testid="site-header"]');
      const hero = document.querySelector('[data-testid="hero-section"]');
      const music = document.querySelector('[data-testid="music-section"]');
      if (!h || !hero || !music) return false;
      return Boolean(
        (h.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (hero.compareDocumentPosition(music) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });
    expect(correctOrder).toBe(true);

    await expect(hero.getByRole('heading', { level: 1 })).toContainText(/built\s*to\s*fix/i);
    await expect(hero).toContainText(/ready\s*to\s*fly/i);
    await expect(hero).toContainText(/mobile bike repair/i);
    await expect(hero).toContainText(/trail preparation/i);
    await expect(hero).toContainText(/one-on-one coaching/i);
    await expect(hero.getByRole('link', { name: 'Request Service', exact: true })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Explore Coaching', exact: true })).toBeVisible();
    await expect(hero.getByRole('link', { name: /see the action/i })).toBeVisible();

    await expect(music).toContainText("Dom’s Original Song");
    await expect(music.getByRole('button', { name: /play dom’s original song/i })).toBeVisible();

    const bg = await hero.evaluate((element) => getComputedStyle(element, '::before').backgroundImage);
    expect(bg).toContain('DOMPROJ.jpg');

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    );
    expect(noHorizontalOverflow).toBe(true);

    if (viewport.width >= 1040) {
      for (const label of ['Soundtrack', 'Dom Code', 'Services', 'Tribute', 'Story', 'Gallery', 'Book Dom']) {
        await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
    } else {
      await expect(header.getByRole('button', { name: /open navigation/i })).toBeVisible();
    }
  });
}
