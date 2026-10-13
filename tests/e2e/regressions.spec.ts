import { expect, test } from '@playwright/test';

/* =============================================================================
   FEATURE E, plus the cross-cutting "did we break anything" sweep.

   🔴 THIS FILE IS THE ONE THAT CATCHES COLLATERAL DAMAGE. Four of the five
   changes touched shared components — the nav, the hero, the blog's data layer
   — and the brief's definition of success is that everything already working
   keeps working. These are the existing critical paths, asserted at every
   viewport.
   ========================================================================== */

test.describe('Feature E — the About Us logo', () => {
  test('the logo has no white card behind it and keeps its gold ring', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    /* ⚠️ SCOPED TO THE STORY SECTION. The nav badge renders the SAME file in a
       `bg-white rounded-full` frame — correctly, that is the medallion — so an
       unscoped `.first()` asserts against the header and reports a white
       background that is supposed to be there. */
    const mark = page.locator('section:has(#story-title) img[src*="newlogo"]').first();
    await mark.scrollIntoViewIfNeeded();
    await expect(mark).toBeVisible();

    const wrapper = mark.locator('..');
    const styles = await wrapper.evaluate((el) => {
      const s = getComputedStyle(el);
      return { background: s.backgroundColor, radius: s.borderRadius, padding: s.padding };
    });

    /* 🔴 NO PANEL. The container used to be `rounded-card bg-surface p-6`, which
       painted a cream square well outside the artwork — the reported white
       placeholder. It must now be transparent with no padding of its own. */
    expect(styles.background, 'the logo container must not be painted').toMatch(
      /rgba\(0, 0, 0, 0\)|transparent/,
    );
    expect(styles.padding).toBe('0px');

    /* …and the white corners of the JPEG are removed by a CIRCULAR clip, which
       lands on the artwork's own gold ring (it spans 98.8% of the width). */
    const box = await wrapper.boundingBox();
    expect(box).not.toBeNull();
    const radius = parseFloat(styles.radius);
    expect(radius, 'the clip must be a full circle').toBeGreaterThanOrEqual(box!.width / 2 - 1);

    /* 🔴 NO DESTRUCTIVE FILTER. A `mix-blend-multiply` or a `filter` would knock
       the white out and take the gold's highlights and the green lettering with
       it — the exact damage the brief warns against. */
    const treatment = await mark.evaluate((el) => {
      const s = getComputedStyle(el);
      return { filter: s.filter, blend: s.mixBlendMode, opacity: s.opacity };
    });
    expect(treatment.filter).toBe('none');
    expect(treatment.blend).toBe('normal');
    expect(treatment.opacity).toBe('1');
  });
});

test.describe('existing behaviour that must not regress', () => {
  test('the WhatsApp float still points at the real number', async ({ page }) => {
    await page.goto('/');
    const whatsapp = page.getByRole('link', { name: /WhatsApp/i }).first();
    await expect(whatsapp).toHaveAttribute('href', /wa\.me\/917799774169/);
    await expect(whatsapp).toHaveAttribute('rel', /noopener/);
  });

  test('the contact form still posts to the CMS enquiry endpoint', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    /* 🔴 THE ONE BROWSER-SIDE WRITE IN THE WHOLE CODEBASE, and the single most
       important thing in this file not to have broken. It is asserted by
       INTERCEPTING the POST and never letting it reach the network, so no lead
       row is created anywhere — the brief forbids production test enquiries,
       and a fixture CMS would have accepted one just as misleadingly.

       The path is `/leads`, which is what `ContactForm` actually posts to. */
    let posted: { url: string; method: string; body: string } | null = null;
    await page.route('**/leads', async (route) => {
      posted = {
        url: route.request().url(),
        method: route.request().method(),
        body: route.request().postData() ?? '',
      };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'intercepted-by-the-test-suite' } }),
      });
    });

    await page.getByLabel('Name', { exact: true }).fill('Playwright Regression');
    await page.getByLabel('Phone', { exact: true }).fill('9999999999');
    await page.getByRole('button', { name: /Request a call back/ }).click();

    await expect.poll(() => posted, { timeout: 15_000 }).not.toBeNull();
    expect(posted!.method).toBe('POST');
    expect(posted!.url).toContain('/leads');
    /* The payload still carries what the backend's lead contract expects. */
    expect(posted!.body).toContain('Playwright Regression');
    expect(posted!.body).toContain('9999999999');

    /* And the success state renders, so the whole round trip is wired. */
    await expect(page.getByRole('status')).toContainText('we have your enquiry');
  });

  test('every primary route still renders', async ({ page }) => {
    for (const path of ['/', '/about', '/projects', '/gallery', '/blog', '/contact']) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should be 200`).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('no page scrolls sideways', async ({ page }) => {
    for (const path of ['/', '/about', '/projects', '/blog', '/contact']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(1);
    }
  });

  test('no console errors and no failed requests on the changed pages', async ({ page }) => {
    const errors: string[] = [];
    const failed: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('response', (response) => {
      /* 🔶 YouTube's thumbnail host is allowed to 404: `YouTubeThumb` asks for
         `maxresdefault` first, which only exists for HD uploads, and swaps to
         `hqdefault` on error. That is the designed fallback, not a fault. */
      if (response.status() >= 400 && !response.url().includes('i.ytimg.com')) {
        failed.push(`${response.status()} ${response.url()}`);
      }
    });

    for (const path of ['/', '/blog', '/blog/tes', '/about']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }

    expect(errors, 'console errors').toEqual([]);
    expect(failed, 'failed requests').toEqual([]);
  });
});
