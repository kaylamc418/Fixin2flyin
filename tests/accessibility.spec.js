import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';

test('homepage accessibility smoke checks', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main');
  await expect(page.locator('main#main')).toHaveCount(1);

  const images = page.locator('img');
  const imageCount = await images.count();
  for (let index = 0; index < imageCount; index += 1) {
    await expect(images.nth(index)).toHaveAttribute('alt');
  }

  const requiredFields = page.locator('input[required], select[required], textarea[required]');
  const requiredCount = await requiredFields.count();
  for (let index = 0; index < requiredCount; index += 1) {
    const field = requiredFields.nth(index);
    const labelText = await field.locator('xpath=ancestor::label[1]').textContent();
    expect(labelText?.trim().length).toBeGreaterThan(0);
  }

  const navButton = page.getByRole('button', { name: /open navigation/i });
  await expect(navButton).toHaveCount(1);
  await navButton.click();
  await expect(navButton).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(navButton).toHaveAttribute('aria-expanded', 'false');
  await expect(navButton).toBeFocused();

  await expect(page.getByRole('button', { name: /play peak bound/i })).toHaveCount(1);

  const firstGalleryItem = page.locator('.gallery-item').first();
  await expect(firstGalleryItem).toBeVisible();
  await firstGalleryItem.click();
  const closePreview = page.getByRole('button', { name: /close image preview/i });
  await expect(closePreview).toBeVisible();
  await closePreview.click();
  await expect(closePreview).toBeHidden();
  await expect(firstGalleryItem).toBeFocused();

  expect(consoleErrors).toEqual([]);
});
