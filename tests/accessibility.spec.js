import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';

test('homepage accessibility smoke checks', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  // Exercise the compact navigation state explicitly instead of relying on
  // Playwright's default desktop viewport.
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

  await expect(page.getByRole('button', { name: /open navigation/i })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /play peak bound/i })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /close image preview/i })).toHaveCount(1);

  expect(consoleErrors).toEqual([]);
});
