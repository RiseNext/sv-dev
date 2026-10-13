/* =============================================================================
   THE E2E HARNESS — a fixture CMS, a production build against it, and `next
   start`. Playwright's `webServer` runs this one file and waits for the port.

   ─── WHY A BUILD AND NOT `next dev` ───────────────────────────────────────
   🔴 THE DATA LAYER IS SERVER-ONLY AND RUNS AT BUILD OR REVALIDATE TIME, NEVER
   PER REQUEST (see `src/lib/api/client.ts`). So what a visitor sees is what the
   BUILD baked in — and a suite run against `next dev` would be testing a code
   path that production does not use. It would also miss exactly the class of
   bug this project has hit before: a next/image host that is fine in dev and
   throws "hostname is not configured" at build.

   ─── WHY A FIXTURE CMS AND NOT THE LIVE ONE ───────────────────────────────
   See the header of `fixtures/cms.mjs`. Short version: the live CMS cannot
   express a four-slide mixed hero or a text-only post, and the suite must never
   write to production.

   🔶 ANYTHING NOT FIXTURED IS PROXIED, READ-ONLY, TO THE REAL API. Projects,
   FAQs and statistics are not what these tests are about, but the pages under
   test render them — so they come from the live public API rather than from
   invented records, which is also what keeps the fixture file honest about
   being small. GET only; the proxy refuses every other method outright. If the
   network is unavailable those endpoints answer 404 and the data layer's own
   `fallback: []` takes over, so the suite degrades rather than failing.

   ─── IT NEVER TOUCHES THE DEVELOPER'S OWN BUILD ───────────────────────────
   `NEXT_DIST_DIR=.next-e2e`, which `next.config.mjs` already honours. A suite
   that overwrote `.next` would silently invalidate whatever the developer had
   running.
   ========================================================================== */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { SITE_SETTINGS, BLOG_POSTS, TESTIMONIALS } from './fixtures/cms.mjs';

const CMS_PORT = 4311;
const APP_PORT = 3100;
const UPSTREAM = 'https://svdevbackend-production.up.railway.app/api/v1';

/* The envelope every endpoint uses — `getJson` unwraps `.data` and nothing
   else. Getting this wrong is the one mistake that makes every page empty with
   no error, so it lives in one place. */
const send = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body),
  });
  res.end(body);
};

/* The fixtured routes, exact-match. `/blog-posts/<slug>` is handled separately
   below because it is parameterised. */
const ROUTES = {
  '/api/v1/site-settings': SITE_SETTINGS,
  /* 🔴 THE LIST ENDPOINT OMITS `body`, exactly as the real one does — see the
     note on `BlogPostCard`. Shipping it here would let a test pass against a
     payload production never sends. */
  '/api/v1/blog-posts': BLOG_POSTS.map(({ body, ...card }) => card),
  '/api/v1/testimonials': TESTIMONIALS,
};

const cms = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${CMS_PORT}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (req.method !== 'GET') {
    return send(res, 405, { error: 'the fixture CMS is read-only' });
  }

  if (path in ROUTES) return send(res, 200, { data: ROUTES[path] });

  /* One post, WITH its body. A slug that is not fixtured must 404 — not 500 and
     not an empty object — because `/blog/[slug]` relies on the 404 staying
     distinguishable to call notFound(). */
  const postMatch = path.match(/^\/api\/v1\/blog-posts\/(.+)$/);
  if (postMatch) {
    const post = BLOG_POSTS.find((p) => p.slug === decodeURIComponent(postMatch[1]));
    return post ? send(res, 200, { data: post }) : send(res, 404, { error: 'not found' });
  }

  /* Everything else: proxied to the real public API, read-only. */
  try {
    const upstream = await fetch(`${UPSTREAM}${path.replace('/api/v1', '')}${url.search}`, {
      headers: { accept: 'application/json' },
    });
    const text = await upstream.text();
    res.writeHead(upstream.status, { 'content-type': 'application/json' });
    return res.end(text);
  } catch {
    /* Offline. 404 rather than 500 so `getJsonOrNull` and the `fallback: []`
       readers both take their documented empty path instead of throwing. */
    return send(res, 404, { error: 'upstream unavailable' });
  }
});

const run = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...env },
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)),
    );
  });

/* The two variables the build bakes in. The media base is Cloudinary's real
   delivery origin, because the fixtures reference real assets there and
   `next.config.mjs` derives its image allowlist from this value — point it
   anywhere else and every slide throws at build. */
const BUILD_ENV = {
  NEXT_PUBLIC_API_BASE_URL: `http://127.0.0.1:${CMS_PORT}/api/v1`,
  NEXT_PUBLIC_MEDIA_BASE_URL: 'https://res.cloudinary.com/lcjjdvym',
  NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${APP_PORT}`,
  NEXT_DIST_DIR: '.next-e2e',
};

cms.listen(CMS_PORT, '127.0.0.1', async () => {
  console.log(`[e2e] fixture CMS on http://127.0.0.1:${CMS_PORT}/api/v1`);

  try {
    /* SKIP_BUILD=1 for a fast re-run while writing tests. Never set in CI: the
       whole point is that the build is what is under test. */
    if (process.env.SKIP_BUILD !== '1') {
      console.log('[e2e] building against the fixture CMS…');
      await run('npx', ['next', 'build'], BUILD_ENV);
    }
    console.log(`[e2e] starting on http://127.0.0.1:${APP_PORT}`);
    await run('npx', ['next', 'start', '-p', String(APP_PORT), '-H', '127.0.0.1'], BUILD_ENV);
  } catch (error) {
    console.error('[e2e]', error.message);
    process.exit(1);
  }
});
