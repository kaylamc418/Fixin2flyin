import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  outputDir: 'test-results',
});
