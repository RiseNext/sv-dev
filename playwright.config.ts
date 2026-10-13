import { defineConfig, devices } from '@playwright/test';

/* =============================================================================
   PLAYWRIGHT — the frontend's first automated suite.

   🔴 THE VIEWPORT LIST IS THE BRIEF'S, NOT A DEFAULT. Two desktop widths and
   four phone widths, each a real device class rather than a round number:

     1366×768   the single most common laptop resolution still in service
     1440×900   the other one, and the width the nav's one-line wordmark was
                budgeted against
      320×700   the narrowest screen anything still ships — iPhone SE 1st gen.
                This is the width that breaks headers, and it is the reason the
                wordmark carries `[overflow-wrap:anywhere]`
      360×800   the modal Android
      390×844   iPhone 12–15
      430×932   iPhone Pro Max

   Every spec runs at every viewport unless it opts out by name. That is more
   runs than a "mobile + desktop" split would give, and it is deliberate: three
   of the five changes here are layout changes whose failure mode is "fine at
   390, broken at 320".

   `hasTouch` on the phones is load-bearing for the carousels — their swipe
   handlers ignore `pointerType === 'mouse'`, so a phone-sized viewport WITHOUT
   touch would silently never exercise the swipe path.
   ========================================================================== */

const BASE_URL = 'http://127.0.0.1:3100';

const phone = (width: number, height: number) => ({
  ...devices['Desktop Chrome'],
  viewport: { width, height },
  isMobile: true,
  hasTouch: true,
  /* `isMobile` alone does not give Chromium a touch-capable pointer; both are
     needed before `pointer: coarse` and touch events behave like a phone. */
  deviceScaleFactor: 2,
});

export default defineConfig({
  testDir: './tests/e2e',
  /* The suite asserts on layout and on media that must actually load, so a
     flaky-retry would hide exactly the failures worth seeing. One retry only,
     for genuine network noise from the proxied endpoints. */
  retries: 1,
  /* Chromium decodes real video on these pages; four workers of that on a
     laptop is enough to cause timeouts that are not the site's fault. */
  workers: 2,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'tests/.report' }]],

  use: {
    baseURL: BASE_URL,
    /* Kept only for failures — a trace per passing test across six viewports is
       hundreds of megabytes of nothing. */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop-1366', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-320', use: phone(320, 700) },
    { name: 'mobile-360', use: phone(360, 800) },
    { name: 'mobile-390', use: phone(390, 844) },
    { name: 'mobile-430', use: phone(430, 932) },
  ],

  webServer: {
    command: 'node tests/server.mjs',
    url: BASE_URL,
    /* A cold `next build` plus the fixture CMS coming up. Generous because the
       alternative — a suite that fails on a slow machine before it has run a
       single assertion — is worse than a long first wait. */
    timeout: 300_000,
    /* 🔴 NEVER REUSE. The build is part of what is under test, so an existing
       server on this port is a stale artefact, not a shortcut. */
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
