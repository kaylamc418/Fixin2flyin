import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

for (const vp of viewports) {
  test(`Audit visual overlaps on ${vp.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL);
    await page.waitForTimeout(1000);

    const marquee = await page.locator('.marquee-container').boundingBox();
    const domCode = await page.locator('#dom-code').boundingBox();

    if (marquee && domCode) {
      expect(domCode.y).toBeGreaterThanOrEqual(marquee.y + marquee.height);
    }

    const cards = page.locator('.dom-code-card');
    const cardCount = await cards.count();

    for (let i = 0; i < cardCount; i++) {
      const box = await cards.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box.height).toBeGreaterThan(150);
    }
  });
}
