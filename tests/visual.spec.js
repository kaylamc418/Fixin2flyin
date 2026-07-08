import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

for (const vp of viewports) {
  test(`Hero layout matches requirements on ${vp.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const hero = page.locator('.f2f-hero-viewport');
    const left = page.locator('.f2f-hero-wordmark.left-side');
    const right = page.locator('.f2f-hero-wordmark.right-side');

    await expect(hero).toBeVisible();
    await expect(left).toBeVisible();
    await expect(right).toBeVisible();

    const heroStyles = await hero.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        backgroundImage: styles.backgroundImage,
        backgroundPosition: styles.backgroundPosition,
        backgroundRepeat: styles.backgroundRepeat,
        backgroundSize: styles.backgroundSize,
        display: styles.display,
        flexDirection: styles.flexDirection,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
      };
    });

    expect(heroStyles.backgroundImage).toContain('DOMPROJ.jpg');
    expect(heroStyles.backgroundSize).toBe('cover');
    expect(heroStyles.backgroundPosition).toContain('50% calc(100% +');
    expect(heroStyles.backgroundRepeat).toBe('no-repeat');
    expect(heroStyles.display).toBe('flex');

    const fixColor = await page.locator('.hero-line-fix').evaluate((el) => getComputedStyle(el).color);
    const flyColor = await page.locator('.hero-line-fly').evaluate((el) => getComputedStyle(el).color);

    expect(fixColor).toBe('rgb(252, 243, 202)');
    expect(flyColor).toBe('rgb(189, 92, 255)');

    const heroBox = await hero.boundingBox();
    const leftBox = await left.boundingBox();
    const rightBox = await right.boundingBox();

    expect(heroBox).not.toBeNull();
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();

    if (vp.width < 768) {
      expect(heroStyles.flexDirection).toBe('column');
      expect(rightBox.y).toBeGreaterThan(leftBox.y + leftBox.height);
    } else {
      expect(heroStyles.justifyContent).toBe('space-between');
      expect(heroStyles.alignItems).toBe('center');
      expect(leftBox.x).toBeLessThanOrEqual(heroBox.x + heroBox.width * 0.08);
      expect(rightBox.x + rightBox.width).toBeGreaterThanOrEqual(heroBox.x + heroBox.width * 0.92);
    }
  });
}
