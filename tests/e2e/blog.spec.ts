import { expect, test, type Locator, type Page } from '@playwright/test';

/* =============================================================================
   FEATURE B — the play button tells the truth, and a card opens the ARTICLE
   rather than teleporting the visitor off the site.

   The five fixture posts are one per case; see `tests/fixtures/cms.mjs`.
   ========================================================================== */

/** The card for a post, located by its heading rather than by position — the
 *  index renders the first post as a FEATURE card and the rest as grid cards,
 *  and which post is first is the API's decision, not ours. */
const card = (page: Page, title: string): Locator =>
  page.locator('a[href^="/blog/"]').filter({ hasText: title }).first();

/* The glyph is `aria-hidden` (the card's own label says what it is), so it
   cannot be found by role — it is located structurally, which is also the
   honest test: "is a play affordance painted on this card". */
const playGlyph = (scope: Locator): Locator => scope.locator('span.rounded-full svg');

test.describe('the play button only appears on genuinely playable posts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
  });

  test('a text-only article has no play button and no media box', async ({ page }) => {
    const target = card(page, 'Fixture: a text-only article');
    await expect(target).toBeVisible();
    await expect(playGlyph(target)).toHaveCount(0);
    /* No cover and no video means NO media box at all — not an empty grey
       panel. The card is a type-only card. */
    await expect(target.locator('img')).toHaveCount(0);
    await expect(target).toContainText('Read the article');
  });

  test('an image-only article has no play button but keeps its cover', async ({ page }) => {
    const target = card(page, 'Fixture: an image-only article');
    await expect(target).toBeVisible();
    /* 🔴 THE CASE A THUMBNAIL-BASED INFERENCE WOULD GET WRONG: there IS an
       image, and there is still no video. */
    await expect(target.locator('img')).toHaveCount(1);
    await expect(playGlyph(target)).toHaveCount(0);
    await expect(target).toContainText('Read the article');
  });

  test('a post whose video URL will not parse shows no play button or duration', async ({ page }) => {
    const target = card(page, 'Fixture: an unplayable video URL');
    await expect(target).toBeVisible();

    /* 🔴 THE REGRESSION THIS CHANGE EXISTS FOR. The record HAS a `video`
       object — the old `Boolean(post.video)` test called it a video post — but
       its URL is a LinkedIn link, so there is nothing to play and the detail
       page mounts no player. Promising one here was the bug. */
    await expect(playGlyph(target)).toHaveCount(0);
    /* The duration badge is the same false promise in smaller type. */
    await expect(target).not.toContainText('4:20');
    await expect(target).toContainText('Read the article');
  });

  test('a post with a real YouTube link keeps its play button', async ({ page }) => {
    const target = card(page, 'test2');
    await expect(target).toBeVisible();
    await expect(playGlyph(target)).toHaveCount(1);
    await expect(target).toContainText('Watch the video');
  });
});

test.describe('navigation goes to the article first, never straight out', () => {
  test('a card with an externalUrl opens the internal article page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const target = card(page, 'test2');

    /* 🔴 THE FIX, ASSERTED AT THE ATTRIBUTE. This post carries
       `externalUrl: geeksforgeeks.org`. Its card must point at THIS site. */
    await expect(target).toHaveAttribute('href', '/blog/tes');
    await expect(target).not.toHaveAttribute('target', '_blank');
    /* And the card must no longer advertise someone else's domain. */
    await expect(target).not.toContainText('geeksforgeeks.org');

    await target.click();
    await expect(page).toHaveURL(/\/blog\/tes$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('test2');
  });

  test('no blog card anywhere leaves the site', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    /* A sweep rather than a per-post assertion: the rule is that NO card is an
       outbound link, and a sweep keeps holding when posts are added. */
    const hrefs = await page.locator('main a[href]').evaluateAll((links) =>
      links.map((l) => (l as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
    const outbound = hrefs.filter((h) => /^https?:\/\//.test(h));
    expect(outbound, `no card on the blog index may link off-site: ${outbound.join(', ')}`).toEqual([]);
  });

  test('the external link is inside the article, named, and safely attributed', async ({ page }) => {
    await page.goto('/blog/tes');
    await page.waitForLoadState('networkidle');

    const outbound = page.getByRole('link', { name: /Read the full article/ });
    await expect(outbound).toBeVisible();

    /* It names its destination, which is what the card used to do and should
       not have — a link that leaves the site says so where it actually leaves. */
    await expect(outbound).toContainText('geeksforgeeks.org');
    await expect(outbound).toHaveAttribute(
      'href',
      'https://www.geeksforgeeks.org/dsa/introduction-of-object-oriented-programming/',
    );
    await expect(outbound).toHaveAttribute('target', '_blank');
    await expect(outbound).toHaveAttribute('rel', /noopener/);
    await expect(outbound).toHaveAttribute('rel', /noreferrer/);
  });

  test("an external post's own body is rendered, not suppressed", async ({ page }) => {
    await page.goto('/blog/tes');
    await page.waitForLoadState('networkidle');
    /* It used to be hidden on the reasoning that nobody arrived here. Everybody
       does now, so an admin who wrote an introduction must see it. */
    await expect(page.getByText('A fixture body on an EXTERNAL post')).toBeVisible();
  });

  test('a direct URL and a reload both work', async ({ page }) => {
    await page.goto('/blog/fixture-text-only');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('text-only article');

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('text-only article');
    expect(page.url()).toContain('/blog/fixture-text-only');
  });

  test('an unknown slug is a 404, not a crash', async ({ page }) => {
    const response = await page.goto('/blog/no-such-post-exists');
    expect(response?.status()).toBe(404);
  });

  test('a post with no playable video mounts no player on its page', async ({ page }) => {
    await page.goto('/blog/fixture-unplayable-video');
    await page.waitForLoadState('networkidle');

    /* The other half of the promise: the card shows no play glyph BECAUSE this
       page has no player. If this ever renders one, the card is wrong.

       ⚠️ ASSERTED ON THE PLAYER, NOT ON `/play/i`. A name regex matches the
       share button on this very post — its accessible name is "Share Fixture:
       an unPLAYable video URL". Matching a substring of admin-supplied content
       is how a test ends up asserting something it did not mean. */
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Play / })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Watch on YouTube/ })).toHaveCount(0);

    /* The cover still renders — the post is an article with a picture, which is
       exactly what it should degrade to. */
    await expect(page.locator('main img, article img').first()).toBeVisible();
  });
});
