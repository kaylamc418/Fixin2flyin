import { test, expect } from '@playwright/test';

const BASE_URL =
  process.env.BASE_URL ||
  'https://fixin2flyin.kayamc418.workers.dev';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`Homepage matches approved layout on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const header = page.locator('[data-testid="site-header"]');
    const musicSection = page.locator('[data-testid="music-section"]');
    const hero = page.locator('[data-testid="hero-section"]');
    const heroContent = page.locator('[data-testid="hero-content"]');
    const heroActions = page.locator('[data-testid="hero-actions"]');

    await expect(header).toBeVisible();
    await expect(musicSection).toBeVisible();
    await expect(hero).toBeVisible();
    await expect(heroContent).toBeVisible();

    const sectionOrderIsCorrect = await page.evaluate(() => {
      const siteHeader = document.querySelector('[data-testid="site-header"]');
      const music = document.querySelector('[data-testid="music-section"]');
      const heroSection = document.querySelector('[data-testid="hero-section"]');

      if (!siteHeader || !music || !heroSection) return false;

      const headerBeforeMusic = Boolean(
        siteHeader.compareDocumentPosition(music) &
          Node.DOCUMENT_POSITION_FOLLOWING
      );

      const musicBeforeHero = Boolean(
        music.compareDocumentPosition(heroSection) &
          Node.DOCUMENT_POSITION_FOLLOWING
      );

      return headerBeforeMusic && musicBeforeHero;
    });

    expect(sectionOrderIsCorrect).toBe(true);

    await expect(
      musicSection.getByRole('heading', {
        name: /sound behind fixin’ 2 flyin’/i,
      })
    ).toBeVisible();

    const playButton = musicSection.getByRole('button', {
      name: /play dom’s original song/i,
    });

    await expect(playButton).toBeVisible();
    await expect(playButton).toHaveAttribute('aria-pressed', 'false');
    await playButton.click();
    await expect(playButton).toHaveAttribute('aria-pressed', 'true');
    await playButton.click();
    await expect(playButton).toHaveAttribute('aria-pressed', 'false');

    await expect(
      page.locator(
        'iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]'
      )
    ).toHaveCount(0);

    const heroHeading = hero.getByRole('heading', { level: 1 });
    await expect(heroHeading).toContainText(/built to fix\.\s*ready to fly\./i);
    await expect(hero).toContainText(/mobile bike repair/i);
    await expect(hero).toContainText(/trail preparation/i);
    await expect(hero).toContainText(/one-on-one coaching/i);

    await expect(
      hero.getByRole('link', {
        name: 'Request Service',
        exact: true,
      })
    ).toBeVisible();

    await expect(
      hero.getByRole('link', {
        name: 'Explore Coaching',
        exact: true,
      })
    ).toBeVisible();

    await expect(page.locator('body')).not.toContainText(/life behind the bars/i);
    await expect(page.locator('body')).not.toContainText(/add a licensed audio file later/i);
    await expect(page.locator('body')).not.toContainText(/ready to ride meaner/i);
    await expect(page.locator('body')).not.toContainText(/we fix it\. you fly/i);

    const removedNavigationLabels = ['Soundtrack', 'Dom Code', 'Story', 'Book'];

    for (const label of removedNavigationLabels) {
      await expect(
        header.getByRole('link', {
          name: label,
          exact: true,
        })
      ).toHaveCount(0);
    }

    if (viewport.width >= 1040) {
      const requiredNavigationLabels = [
        'Home',
        'Services',
        'How It Works',
        'About',
        'Tribute',
        'Gallery',
        'Contact',
      ];

      for (const label of requiredNavigationLabels) {
        await expect(
          header.getByRole('link', {
            name: label,
            exact: true,
          })
        ).toBeVisible();
      }
    }

    const heroStyles = await hero.locator('.f2f-hero-viewport').evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        backgroundImage: styles.backgroundImage,
        backgroundPosition: styles.backgroundPosition,
        backgroundRepeat: styles.backgroundRepeat,
        backgroundSize: styles.backgroundSize,
        display: styles.display,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        textAlign: styles.textAlign,
        overflowX: styles.overflowX,
      };
    });

    expect(heroStyles.backgroundImage).toContain('DOMPROJ.jpg');
    expect(heroStyles.backgroundSize).toBe('cover');
    expect(heroStyles.backgroundRepeat).toBe('no-repeat');
    expect(heroStyles.display).toBe('flex');
    expect(heroStyles.justifyContent).toBe('center');
    expect(heroStyles.alignItems).toBe('center');
    expect(heroStyles.textAlign).toBe('center');
    expect(heroStyles.overflowX).not.toBe('scroll');

    const fixColor = await page
      .locator('.hero-line-fix')
      .evaluate((element) => getComputedStyle(element).color);

    const flyColor = await page
      .locator('.hero-line-fly')
      .evaluate((element) => getComputedStyle(element).color);

    expect(fixColor).toBe('rgb(252, 243, 202)');
    expect(flyColor).toBe('rgb(189, 92, 255)');

    const heroBox = await hero.boundingBox();
    const contentBox = await heroContent.boundingBox();

    expect(heroBox).not.toBeNull();
    expect(contentBox).not.toBeNull();

    if (!heroBox || !contentBox) {
      throw new Error('Unable to calculate hero layout dimensions.');
    }

    expect(contentBox.width).toBeLessThanOrEqual(
      Math.min(820, heroBox.width * 0.94)
    );

    const heroCenter = heroBox.x + heroBox.width / 2;
    const contentCenter = contentBox.x + contentBox.width / 2;

    expect(Math.abs(heroCenter - contentCenter)).toBeLessThanOrEqual(24);

    const actionStyles = await heroActions.evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        display: styles.display,
        flexDirection: styles.flexDirection,
        gap: Number.parseFloat(styles.gap || '0'),
      };
    });

    expect(actionStyles.display).toBe('flex');
    expect(actionStyles.gap).toBeGreaterThanOrEqual(12);

    const requestButton = hero.getByRole('link', {
      name: 'Request Service',
      exact: true,
    });

    const coachingButton = hero.getByRole('link', {
      name: 'Explore Coaching',
      exact: true,
    });

    const requestBox = await requestButton.boundingBox();
    const coachingBox = await coachingButton.boundingBox();

    expect(requestBox).not.toBeNull();
    expect(coachingBox).not.toBeNull();

    if (!requestBox || !coachingBox) {
      throw new Error('Unable to calculate hero button positions.');
    }

    expect(requestBox.height).toBeGreaterThanOrEqual(44);
    expect(coachingBox.height).toBeGreaterThanOrEqual(44);

    if (viewport.width < 768) {
      expect(actionStyles.flexDirection).toBe('column');
      expect(coachingBox.y).toBeGreaterThanOrEqual(
        requestBox.y + requestBox.height + 10
      );
    } else {
      expect(actionStyles.flexDirection).toBe('row');
    }

    const hasHorizontalOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1
      );
    });

    expect(hasHorizontalOverflow).toBe(false);

    await expect(page.getByRole('heading', { name: 'Mobile Bike Repair + Coaching' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'A practical process for the bike and rider.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The rider, the builder, and the trail companion.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'For the woman who helped shape the ride.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Repairs, Rides, and Progression' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Get your bike and your ride ready.' })).toBeVisible();
  });
}
