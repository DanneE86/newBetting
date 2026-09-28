import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'unit-data',
      testMatch: /data-pipeline\.spec\.ts/,
    },
    {
      name: 'pro-layer',
      testMatch: /pro-layer\.spec\.ts/,
    },
    {
      name: 'bolldata',
      testMatch: /bolldata\.spec\.ts/,
    },
    {
      name: 'stryktips',
      testMatch: /stryktips\.spec\.ts/,
    },
    {
      name: 'stryktips-regler',
      testMatch: /stryktips-regler\.spec\.ts/,
    },
    {
      name: 'match-context',
      testMatch: /match-context\.spec\.ts/,
    },
    {
      name: 'player-stats',
      testMatch: /player-stats\.spec\.ts/,
    },
    {
      name: 'e2e-screenshots',
      testMatch: /e2e-fetch-screenshots\.spec\.ts/,
    },
  ],
});
