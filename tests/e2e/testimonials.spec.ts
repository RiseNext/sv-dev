import { expect, test, type Page } from '@playwright/test';
import { TESTIMONIALS } from '../fixtures/cms.mjs';

/* =============================================================================
   FEATURE D — reviews are a compact rail on a phone and an unchanged row on a
   desktop.

   The fixture carries the two REAL consented reviews from the live CMS. Two is
   enough to prove the behaviour at every viewport: at `--per-view: 1` (phone)
   the rail is movable, and at `--per-view: 3` (desktop) it is not, which is the
   whole desktop-preservation argument.
   ========================================================================== */

const rail = (page: Page) => page.getByRole('region', { name: 'Buyer reviews' });
const slides = (page: Page) => rail(page).getByRole('group', { name: /^\d+ of \d+$/ });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await rail(page).scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');
});

test('every review is present, with its text, author and role intact', async ({ page }) => {
  await expect(slides(page)).toHaveCount(TESTIMONIALS.length);

  for (const item of TESTIMONIALS) {
    /* 🔴 THE FULL BODY, NOT A PREFIX. The brief forbids shortening real review
       text to save height, so this asserts the whole stored string is in the
       DOM — a `line-clamp` added later would still pass a "contains" check on a
       prefix, but not this. */
    await expect(rail(page).getByText(item.body.trim(), { exact: false })).toHaveCount(1);
    await expect(rail(page).getByText(item.name, { exact: true })).toBeVisible();
    await expect(rail(page).getByText(item.role.trim(), { exact: false }).first()).toBeVisible();
  }
});

test('the reviews are side by side, not stacked', async ({ page }) => {
  const boxes = await slides(page).evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y, h: r.height })),
  );
  expect(boxes.length).toBeGreaterThan(1);

  /* 🔴 THE ACTUAL REQUESTED CHANGE. Stacked means each card begins below the
     last; a rail means they share a row and differ in x. This is what fails if
     the grid ever comes back on a phone. */
  expect(boxes[1]!.x, 'the second review should be beside the first').toBeGreaterThan(boxes[0]!.x);
  expect(Math.abs(boxes[1]!.y - boxes[0]!.y), 'both should share a row').toBeLessThanOrEqual(2);
});

test('the rail is as tall as its tallest card, not the sum of all of them', async ({ page }) => {
  const heights = await slides(page).evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().height),
  );
  const track = await rail(page).locator('ul').first().boundingBox();
  expect(track).not.toBeNull();
  expect(heights.length).toBeGreaterThan(1);

  const tallest = Math.max(...heights);
  const stacked = heights.reduce((total, h) => total + h, 0);

  /* 🔴 THIS IS THE HEIGHT SAVING, STATED EXACTLY. A STACK is as tall as every
     card added together; a RAIL is as tall as its tallest one. Asserting both
     bounds is what makes this a real test of the change rather than of a
     number that happened to be true on the day.

     ⚠️ NOT WRITTEN AS "under N pixels", which is what this used to be — that
     silently assumed the FIRST card was the tallest, and it stopped being so
     the moment the cards were allowed to size to their own content on a phone.
     An assertion that depends on which review the CMS returns first is an
     assertion that fails for the wrong reason. */
  expect(track!.height, 'the rail must not exceed its tallest card').toBeLessThanOrEqual(
    tallest + 4,
  );
  expect(track!.height, 'the rail must be shorter than stacking the cards').toBeLessThan(
    stacked - 4,
  );
});

test('long review text is never cut off', async ({ page }) => {
  const clipped = await rail(page)
    .locator('blockquote')
    .evaluateAll((els) => els.some((el) => el.scrollHeight > el.clientHeight + 2));
  expect(clipped, 'a quote is being clipped by its card').toBe(false);
});

test('nothing moves on its own', async ({ page }) => {
  /* Explicitly asserted because this is where this rail DIFFERS from the
     project carousel it copies: a quote that slides away mid-sentence is the
     worst thing a review carousel can do. */
  const controls = rail(page).getByRole('group', { name: 'Review carousel controls' });
  if ((await controls.count()) === 0) return; /* desktop: static row, nothing to drift */

  const before = await controls.getByRole('button', { name: /^Show the review/ }).first().getAttribute('aria-current');
  await page.waitForTimeout(6000);
  const after = await controls.getByRole('button', { name: /^Show the review/ }).first().getAttribute('aria-current');
  expect(after).toBe(before);
});

test.describe('phone', () => {
  /* The rail only has somewhere to go when the reviews outnumber the slots, so
     the control assertions belong to the narrow viewports. */
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 640, 'one review per view below 640px only');

  test('arrows and dots navigate between reviews', async ({ page }) => {
    const controls = rail(page).getByRole('group', { name: 'Review carousel controls' });
    await expect(controls).toBeVisible();

    const next = controls.getByRole('button', { name: 'Next review' });
    const prev = controls.getByRole('button', { name: 'Previous review' });

    /* The rail runs once and stops — it does not wrap — so the arrows disable
       at the ends, exactly as the project carousel's do. */
    await expect(prev).toBeDisabled();
    await next.click();
    await expect(prev).toBeEnabled();
    await expect(next).toBeDisabled();

    await prev.click();
    await expect(prev).toBeDisabled();
  });

  test('a swipe moves the rail', async ({ page }) => {
    const controls = rail(page).getByRole('group', { name: 'Review carousel controls' });
    const box = await slides(page).first().boundingBox();
    expect(box).not.toBeNull();

    const y = box!.y + box!.height / 2;
    /* 🔴 `pointerType: 'touch'` IS THE WHOLE POINT OF THIS TEST. The handler
       ignores a mouse pointer on purpose, so that dragging across a paragraph
       stays a TEXT SELECTION rather than changing slide. A swipe test that did
       not set the pointer type would pass against a handler that had lost that
       distinction.

       Dispatched on the track's own viewport (the element carrying the
       handlers) and travelling further than the 40px threshold, right to left,
       which means "next". */
    const viewport = rail(page).locator('div.touch-pan-y').first();
    await viewport.dispatchEvent('pointerdown', {
      pointerType: 'touch',
      clientX: box!.x + box!.width - 20,
      clientY: y,
    });
    await viewport.dispatchEvent('pointerup', {
      pointerType: 'touch',
      clientX: box!.x + 20,
      clientY: y,
    });

    /* Moved to the last position, so "next" has nowhere left to go. */
    await expect(controls.getByRole('button', { name: 'Next review' })).toBeDisabled();
  });
});

test.describe('desktop', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, 'three-up only from 1024px');

  test('the desktop layout is an unchanged static row with no controls', async ({ page }) => {
    /* 🔴 THE NO-REGRESSION ASSERTION. With two reviews and three slots in view
       `maxIndex` is 0, so the rail is immovable and renders no controls —
       leaving a flex row of equal-width cards at the same gap the old
       `grid-cols-3 gap-4` produced. */
    await expect(rail(page).getByRole('group', { name: 'Review carousel controls' })).toHaveCount(0);

    const boxes = await slides(page).evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect()).map((r) => ({ x: r.x, w: r.width })),
    );
    /* Equal widths, one-third of the track each, in a row. */
    expect(Math.abs(boxes[0]!.w - boxes[1]!.w)).toBeLessThanOrEqual(1);
    expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x + boxes[0]!.w - 1);
  });
});
