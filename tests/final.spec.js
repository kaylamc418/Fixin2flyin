import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`approved homepage works on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const header = page.locator('[data-testid="site-header"]');
    const music = page.locator('[data-testid="music-section"]');
    const hero = page.locator('[data-testid="hero-section"]');
    const heroContent = page.locator('[data-testid="hero-content"]');

    await expect(header).toBeVisible();
    await expect(music).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(heroContent).toBeVisible();

    const correctOrder = await page.evaluate(() => {
      const headerElement = document.querySelector('[data-testid="site-header"]');
      const musicElement = document.querySelector('[data-testid="music-section"]');
      const heroElement = document.querySelector('[data-testid="hero-section"]');
      if (!headerElement || !musicElement || !heroElement) return false;
      return Boolean(
        (headerElement.compareDocumentPosition(musicElement) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (musicElement.compareDocumentPosition(heroElement) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });
    expect(correctOrder).toBe(true);

    await expect(music).toContainText("Dom’s Original Song");
    await expect(music.getByRole('button', { name: /play dom’s original song/i })).toBeVisible();

    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText(/life behind the bars/i);
    await expect(page.locator('body')).not.toContainText(/ready to ride meaner/i);
    await expect(page.locator('body')).not.toContainText(/add a licensed audio file later/i);
    await expect(page.locator('body')).not.toContainText(/we fix it\. you fly/i);

    await expect(hero.getByRole('heading', { level: 1 })).toContainText(/built to fix\.\s*ready to fly\./i);
    await expect(hero).toContainText(/mobile bike repair/i);
    await expect(hero).toContainText(/trail preparation/i);
    await expect(hero).toContainText(/one-on-one coaching/i);
    await expect(hero.getByRole('link', { name: 'Request Service', exact: true })).toBeVisible();
    await expect(hero.getByRole('link', { name: 'Explore Coaching', exact: true })).toBeVisible();

    const heroStyles = await hero.locator('.f2f-hero-viewport').evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundImage: styles.backgroundImage,
        backgroundSize: styles.backgroundSize,
        backgroundRepeat: styles.backgroundRepeat,
        display: styles.display,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        textAlign: styles.textAlign,
      };
    });

    expect(heroStyles.backgroundImage).toContain('DOMPROJ.jpg');
    expect(heroStyles.backgroundSize.split(',').every((value) => value.trim() === 'cover')).toBe(true);
    expect(heroStyles.backgroundRepeat.split(',').every((value) => value.trim() === 'no-repeat')).toBe(true);
    expect(heroStyles.display).toBe('flex');
    expect(heroStyles.alignItems).toBe('center');
    expect(heroStyles.justifyContent).toBe('center');
    expect(heroStyles.textAlign).toBe('center');

    const heroBox = await hero.boundingBox();
    const contentBox = await heroContent.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    if (!heroBox || !contentBox) throw new Error('Hero dimensions unavailable');

    const heroCenter = heroBox.x + heroBox.width / 2;
    const contentCenter = contentBox.x + contentBox.width / 2;
    expect(Math.abs(heroCenter - contentCenter)).toBeLessThanOrEqual(24);
    expect(contentBox.width).toBeLessThanOrEqual(Math.min(820, heroBox.width * 0.94));

    const requiredHeadings = [
      'Mobile Bike Repair + Coaching',
      'A practical process for the bike and rider.',
      'The rider, the builder, and the trail companion.',
      'For the woman who helped shape the ride.',
      'Repairs, Rides, and Progression',
      'Get your bike and your ride ready.',
    ];

    for (const name of requiredHeadings) {
      const heading = page.getByRole('heading', { name, exact: true });
      await heading.scrollIntoViewIfNeeded();
      await expect(heading).toBeVisible();
    }

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    );
    expect(noHorizontalOverflow).toBe(true);

    if (viewport.width >= 1040) {
      for (const label of ['Home', 'Services', 'How It Works', 'About', 'Tribute', 'Gallery', 'Contact']) {
        await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible();
      }
    } else {
      await expect(header.getByRole('button', { name: /open navigation/i })).toBeVisible();
    }
  });
}
