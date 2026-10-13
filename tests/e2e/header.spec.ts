import { expect, test, type Page } from '@playwright/test';

/* =============================================================================
   FEATURE C — the mobile header: white brand name, aligned with the emblem,
   never clipped, never overflowing.
   ========================================================================== */

/* 🔴 EVERYTHING IS SCOPED TO THE <header>. The footer carries its own copies of
   "About Us" and "Projects", so an unscoped `getByRole('link')` is a strict-mode
   violation that says nothing about the bar. */
const bar = (page: Page) => page.locator('header');
const wordmark = (page: Page) => bar(page).getByText('Shiva Varahi Developers', { exact: true });
const emblem = (page: Page) => bar(page).getByRole('link', { name: /SV Developers — home/ });

/* 1280px is where the bar switches to the one-line wordmark and the geometry
   the desktop has always had. See the note on `BRAND` in PillNav. */
const DESKTOP = 1280;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

test('the brand name is white', async ({ page }) => {
  await expect(wordmark(page)).toBeVisible();
  const colour = await wordmark(page).evaluate((el) => getComputedStyle(el).color);
  /* Asserted as a computed value rather than as a class name, so the test keeps
     holding if the utility is renamed — and fails if a later cascade change
     puts the gold back by another route. */
  expect(colour).toBe('rgb(255, 255, 255)');
});

test('the logo and the brand name sit on one horizontal line', async ({ page }, testInfo) => {
  const mark = await emblem(page).boundingBox();
  const name = await wordmark(page).boundingBox();
  expect(mark).not.toBeNull();
  expect(name).not.toBeNull();

  /* Side by side, not stacked: the name starts to the RIGHT of the emblem. At
     every width, which is the part of the request that is unconditional. */
  expect(name!.x, 'the name starts right of the emblem').toBeGreaterThanOrEqual(
    mark!.x + mark!.width - 1,
  );

  const markCentre = mark!.y + mark!.height / 2;
  const nameCentre = name!.y + name!.height / 2;
  const width = testInfo.project.use.viewport!.width;

  if (width < DESKTOP) {
    /* 🔴 THE ACTUAL COMPLAINT, AND IT IS A PHONE/TABLET ONE. The two used to be
       centred on DIFFERENT boxes — the emblem overhangs the bar, the name was
       centred inside the bar — which left the name visibly high beside the
       mark. They must now agree, within line-box rounding. */
    expect(Math.abs(markCentre - nameCentre), 'vertical centres should agree').toBeLessThanOrEqual(8);
  } else {
    /* 🔴 AND ABOVE 1280px IT IS DELIBERATELY UNCHANGED. The desktop bar was
       already correct and the brief says to preserve it, so the name stays
       centred on the 88px BAR rather than on the 128px medallion — which means
       the two centres differ, on purpose. Asserting the bar centre is what
       would catch the mobile fix leaking upward and moving the desktop name. */
    const barBox = await bar(page).boundingBox();
    expect(Math.abs(nameCentre - (barBox!.y + barBox!.height / 2)), 'desktop: name centred on the bar')
      .toBeLessThanOrEqual(8);
  }
});

test('the brand name does not overlap the menu button or the nav links', async ({ page }) => {
  const name = await wordmark(page).boundingBox();
  expect(name).not.toBeNull();

  /* Whichever of the two is present at this width — the Menu button on a
     phone, the first nav control on a desktop. */
  const menu = bar(page).getByRole('button', { name: /^Menu$/ });
  const neighbour =
    (await menu.count()) > 0 ? menu : bar(page).getByRole('listitem').first();
  const box = await neighbour.boundingBox();
  expect(box).not.toBeNull();

  expect(name!.x + name!.width, 'the name must end before its neighbour starts').toBeLessThanOrEqual(
    box!.x + 1,
  );
});

test('the brand name is never clipped', async ({ page }) => {
  /* The real failure mode at 320px: the text box is narrower than the longest
     word and the browser paints it cut off. `scrollWidth > clientWidth` is
     exactly that condition, and WIDTH is asserted tightly because that is the
     one that actually loses letters. */
  const metrics = await wordmark(page).evaluate((el) => ({
    scrollW: el.scrollWidth,
    clientW: el.clientWidth,
    scrollH: el.scrollHeight,
    clientH: el.clientHeight,
  }));

  expect(metrics.scrollW, 'the wordmark overflows its own box horizontally').toBeLessThanOrEqual(
    metrics.clientW + 1,
  );

  /* ⚠️ HEIGHT GETS 3px OF SLACK, AND IT IS NOT LAZINESS. `--text-wordmark` is a
     clamp, so the font size is fractional (29px at 1440) and the 1.15 leading
     with it (33.35px). `clientHeight` is an integer that rounds the border box
     DOWN while `scrollHeight` rounds the line box UP, so a single line of
     perfectly un-clipped text reports a 2px difference at some widths and 1px
     at others. Asserting equality here measures font metrics, not clipping. */
  expect(metrics.scrollH, 'the wordmark overflows its own box vertically').toBeLessThanOrEqual(
    metrics.clientH + 3,
  );

  /* And every word is actually on screen. */
  const box = await wordmark(page).boundingBox();
  const width = page.viewportSize()!.width;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
});

test('the page never scrolls sideways', async ({ page }) => {
  /* The header is the usual cause, but this is asserted on the DOCUMENT
     because an overflowing bar shows up as a horizontal scrollbar on every
     page of the site, which is the thing that actually matters. */
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'horizontal overflow in pixels').toBeLessThanOrEqual(1);
});

test('the menu opens, closes and reaches every destination', async ({ page }) => {
  const menu = bar(page).getByRole('button', { name: /^Menu$/ });

  if ((await menu.count()) === 0) {
    /* Inline nav width — the links are in the bar and there is no menu button.
       Assert the links instead of skipping, so the desktop projects still
       prove navigation works. */
    await expect(bar(page).getByRole('link', { name: 'About Us' })).toBeVisible();
    await expect(bar(page).getByRole('link', { name: /Book a site visit/ })).toBeVisible();
    return;
  }

  await menu.click();
  const overlay = page.locator('#primary-navigation-overlay');
  await expect(overlay.getByRole('link', { name: 'About Us' })).toBeVisible();

  /* The CTA and the phone number live only behind the menu on a phone, so
     losing them here would make them unreachable. */
  await expect(overlay.getByRole('link', { name: /Book a site visit/ })).toBeVisible();
  await expect(overlay.getByRole('link', { name: /7799774169/ })).toBeVisible();

  await page.getByRole('button', { name: /^Close$/ }).click();
  await expect(overlay).toHaveAttribute('inert', '');
});
