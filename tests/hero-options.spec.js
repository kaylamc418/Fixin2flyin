import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173';

test('capture real-photo hero options', async ({ page }) => {
  fs.mkdirSync('hero-option-screenshots', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/hero-options.html`, { waitUntil: 'networkidle' });

  for (let i = 1; i <= 5; i += 1) {
    const option = page.locator(`#option-${i}`);
    await expect(option).toBeVisible();
    const images = option.locator('img');
    const count = await images.count();
    for (let j = 0; j < count; j += 1) {
      const loaded = await images.nth(j).evaluate((img) => img.complete && img.naturalWidth > 0);
      expect(loaded).toBe(true);
    }
    await option.screenshot({ path: `hero-option-screenshots/hero-option-${i}.png` });
  }
});