import { revalidatePath, revalidateTag } from 'next/cache';

/* =============================================================================
   ON-DEMAND REVALIDATION — the first route.ts this repository has ever had.

   The CMS calls this when content is published, so an editor's change appears
   within seconds instead of waiting out the one-hour ISR floor. Without it,
   "publishing silently does nothing visible" — the single most confusing
   possible failure for an admin.

   🔴 THE SHARED SECRET IS COMPARED IN CONSTANT TIME and is SERVER-ONLY. A
   mismatch returns 401, which only the backend's job log sees — so a typo here
   looks exactly like "publishing is broken". That is why the backend treats a
   401 as a permanent failure and cancels the retry with a named error rather
   than burning retries silently.
   ========================================================================== */

export const dynamic = 'force-dynamic';

type Body = { secret?: string; paths?: string[]; tags?: string[] };

/** Constant-time comparison, so the endpoint cannot be used as a timing oracle
 *  to recover the secret one byte at a time. */
function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: Request): Promise<Response> {
  const expected = process.env.REVALIDATE_SECRET;

  // Fail CLOSED. With no secret configured, this endpoint would otherwise let
  // anyone force a rebuild of every page on the site.
  if (!expected) {
    return Response.json({ revalidated: false, reason: 'not configured' }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ revalidated: false }, { status: 400 });
  }

  if (typeof body.secret !== 'string' || !secretMatches(body.secret, expected)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  const tags = Array.isArray(body.tags) ? body.tags : [];
  const paths = Array.isArray(body.paths) ? body.paths : [];

  for (const tag of tags) {
    if (typeof tag === 'string' && tag.length < 100) revalidateTag(tag);
  }
  for (const path of paths) {
    // Only same-origin absolute paths. A caller cannot make us revalidate
    // something outside this app.
    if (typeof path === 'string' && path.startsWith('/') && path.length < 300) {
      revalidatePath(path);
    }
  }

  return Response.json({ revalidated: true, tags, paths, now: Date.now() });
}
