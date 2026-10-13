import { expect, test, type Page } from '@playwright/test';
import { HERO_MEDIA } from '../fixtures/cms.mjs';

/* =============================================================================
   FEATURE A — the hero carries images AND video, visitors can navigate it, and
   the content card is gone.

   The fixture hero is image · video · image · video — the brief's own example.
   See `tests/fixtures/cms.mjs` for why this cannot be asserted against the live
   CMS (it serves one video and no `heroMedia` at all).
   ========================================================================== */

const controls = (page: Page) => page.getByRole('group', { name: 'Hero slideshow controls' });
const dots = (page: Page) => controls(page).getByRole('button', { name: /^(Layout plan|Site walkthrough|Elevation|Drone pass)$/ });

/* The hero pins and shrinks on scroll, and the pane covers the whole viewport
   until it settles — while it does, "the pointer is over the pane" is true for
   the whole page and the rotation sits paused. Several assertions below are
   about the SETTLED pane, so they scroll to it first. */
async function settleHero(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

test.describe('hero media slideshow', () => {
  test('renders a slide per CMS item and no more', async ({ page }) => {
    await settleHero(page);
    /* Four fixture items => four dots. Asserting the COUNT is what proves the
       slides come from the CMS list rather than from anything hardcoded. */
    await expect(dots(page)).toHaveCount(HERO_MEDIA.length);
  });

  test('the first slide is an image and a video slide exists', async ({ page }) => {
    await settleHero(page);

    /* Slide 1 is `kind: 'image'`, rendered through next/image — so the <img>
       src is Next's optimiser URL wrapping the Cloudinary original. */
    const firstImage = page.locator('.hero-pane img').first();
    await expect(firstImage).toBeVisible();
    await expect(firstImage).toHaveAttribute('src', /_next\/image|res\.cloudinary\.com/);

    /* Slides 2 and 4 are uploaded MP4s. They are in the DOM from the start —
       only their opacity changes — which is what makes the crossfade possible. */
    await expect(page.locator('.hero-pane video')).toHaveCount(2);
  });

  test('next and previous step the slides, and the indicator follows', async ({ page }) => {
    await settleHero(page);

    const firstDot = dots(page).nth(0);
    const secondDot = dots(page).nth(1);
    await expect(firstDot).toHaveAttribute('aria-current', 'true');

    await controls(page).getByRole('button', { name: 'Next slide' }).click();
    await expect(secondDot).toHaveAttribute('aria-current', 'true');
    await expect(firstDot).not.toHaveAttribute('aria-current', 'true');

    await controls(page).getByRole('button', { name: 'Previous slide' }).click();
    await expect(firstDot).toHaveAttribute('aria-current', 'true');

    /* 🔴 PREVIOUS WRAPS BACKWARDS from the first slide. The rotation carries
       the last slide round to the first on its own, so an arrow that dead-ended
       here would contradict the pane three seconds later. */
    await controls(page).getByRole('button', { name: 'Previous slide' }).click();
    await expect(dots(page).nth(HERO_MEDIA.length - 1)).toHaveAttribute('aria-current', 'true');
  });

  test('an indicator selects its own slide', async ({ page }) => {
    await settleHero(page);
    await dots(page).nth(2).click();
    await expect(dots(page).nth(2)).toHaveAttribute('aria-current', 'true');
    await expect(dots(page).nth(0)).not.toHaveAttribute('aria-current', 'true');
  });

  test('leaving a video slide stops that video playing', async ({ page }) => {
    await settleHero(page);

    /* Pause the rotation first, or the 7s auto-advance can move the slide out
       from under the assertion on a slow run. */
    await controls(page).getByRole('button', { name: 'Pause hero slideshow' }).click();
    await dots(page).nth(1).click();

    const video = page.locator('.hero-pane video').first();
    /* Autoplay may legitimately be refused (Low Power Mode, a codec the runner
       lacks), so this asserts the TRANSITION, not that playback ever began:
       whatever state it reaches on its own slide, it must be paused and rewound
       once the visitor has moved away. */
    await page.waitForTimeout(600);
    await dots(page).nth(2).click();
    await page.waitForTimeout(400);

    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.paused), { timeout: 4000 })
      .toBe(true);
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
      .toBe(0);
  });

  test('no video ever plays with sound', async ({ page }) => {
    await settleHero(page);
    const muted = await page
      .locator('.hero-pane video')
      .evaluateAll((els) => els.every((el) => (el as HTMLVideoElement).muted));
    expect(muted).toBe(true);
  });

  test('the controls are a 44px touch target', async ({ page }) => {
    await settleHero(page);
    for (const name of ['Previous slide', 'Next slide', 'Pause hero slideshow']) {
      const box = await controls(page).getByRole('button', { name }).boundingBox();
      expect(box, `${name} should be rendered`).not.toBeNull();
      expect(box!.height, `${name} height`).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('hero content card removal', () => {
  test('the headline text box is gone but the h1 survives for SEO', async ({ page }) => {
    await settleHero(page);

    /* 🔴 THE BOX IS GONE — `hero-glass` was the frosted card that held it. */
    await expect(page.locator('.hero-glass')).toHaveCount(0);

    /* The document still has exactly one h1, with the copy in it, because
       removing the element outright would leave the site's most important page
       with no level-one heading. */
    const h1 = page.locator('h1#hero-title');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(/Land you can build on/);

    /* …and it PAINTS NOTHING. Asserted as a measured box rather than with
       `toBeHidden()`, which would be wrong here: `visually-hidden` is the
       1px-clipped technique (see globals.css), and Playwright correctly reports
       a 1×1 clipped element as visible — being in the accessibility tree is the
       entire point of it. What matters is that the headline occupies no space
       and shows no glyphs, which is what this measures. */
    const box = await h1.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width, 'the headline must not be painted').toBeLessThanOrEqual(1);
    expect(box!.height, 'the headline must not be painted').toBeLessThanOrEqual(1);

    /* And the h1 is the ONLY element carrying that copy, so the card cannot
       have come back somewhere else under a different tag.

       ⚠️ MEASURED ON DIRECT TEXT, NOT ON `textContent`. Every ancestor of the
       h1 — the section, the pane, <body> — also "contains" the string, and all
       of them are legitimately full-size; an ancestor sweep therefore always
       fails and says nothing. What matters is which element OWNS the text. */
    const owners = await page.evaluate(() => {
      /* ⚠️ `<script>` IS EXCLUDED, AND IT IS NOT A LOOPHOLE. Next serialises the
         RSC flight payload into a script tag, so the h1's own copy legitimately
         appears there as data — it is never rendered, and no CSS applies to it.
         Styles and templates are excluded for the same reason. */
      const INERT = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
      const owns = (el: Element) =>
        Array.from(el.childNodes).some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.includes('Land you can build on'),
        );
      return Array.from(document.querySelectorAll('*'))
        .filter((el) => !INERT.has(el.tagName) && owns(el))
        .map((el) => el.id || el.tagName);
    });
    expect(owners, 'only the hidden h1 may carry the headline').toEqual(['hero-title']);
  });

  test('the booking form is visible and usable over the media', async ({ page }) => {
    await settleHero(page);

    const field = page.getByPlaceholder('Your mobile number');
    const submit = page.getByRole('button', { name: /Book a site visit/ }).last();

    await expect(field).toBeVisible();
    await expect(submit).toBeVisible();

    /* 🔴 THE REGRESSION THAT MATTERS: validation still runs and the form still
       behaves. This types a SHORT number on purpose so the submit is REJECTED —
       the suite must never fire a real WhatsApp hand-off or create a lead. */
    await field.fill('12345');
    await submit.click();
    /* Scoped to the pill. A bare `getByRole('alert')` also matches Next's
       `__next-route-announcer__`, which carries `role="alert"` on every page —
       a strict-mode violation that has nothing to do with the form. */
    await expect(page.locator('.enquiry-pill [role="alert"]')).toHaveText(
      'Enter a 10-digit mobile number.',
    );
  });

  test('the controls never sit on top of the booking form', async ({ page }) => {
    await settleHero(page);

    const form = await page.getByPlaceholder('Your mobile number').boundingBox();
    const cluster = await controls(page).boundingBox();
    expect(form).not.toBeNull();
    expect(cluster).not.toBeNull();

    /* The cluster is pinned to the bottom of the pane and the form sits above
       it. Overlap here is the exact failure the brief calls out — controls
       obstructing the booking form on a phone. */
    expect(form!.y + form!.height, 'form bottom vs controls top').toBeLessThanOrEqual(cluster!.y);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing auto-advances and the pause control is withdrawn', async ({ page }) => {
    await settleHero(page);

    /* With no motion there is nothing to pause, so the control correctly does
       not render — but the ARROWS and DOTS stay, because navigating by hand is
       not motion the preference asks us to suppress. */
    await expect(controls(page).getByRole('button', { name: /Pause hero slideshow/ })).toHaveCount(0);
    await expect(controls(page).getByRole('button', { name: 'Next slide' })).toBeVisible();

    const before = await dots(page).nth(0).getAttribute('aria-current');
    await page.waitForTimeout(8000);
    /* Longer than the 7s rotation: the slide must not have moved. */
    expect(await dots(page).nth(0).getAttribute('aria-current')).toBe(before);
  });
});
