import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://fixin2flyin.kayamc418.workers.dev';

test('PWA metadata and offline assets are published', async ({ page, request }) => {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute('href', '/site.webmanifest');

  const manifestResponse = await request.get(`${BASE_URL}/site.webmanifest`);
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe('Fixin’ 2 Flyin’');
  expect(manifest.start_url).toBe('/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons?.length).toBeGreaterThan(0);

  const serviceWorkerResponse = await request.get(`${BASE_URL}/service-worker.js`);
  expect(serviceWorkerResponse.ok()).toBe(true);
  const serviceWorker = await serviceWorkerResponse.text();
  expect(serviceWorker).toContain('fixin2flyin-split-hero-2026-09-29');
  expect(serviceWorker).toContain('self.addEventListener("fetch"');
});
