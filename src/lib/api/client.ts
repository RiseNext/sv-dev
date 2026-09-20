import 'server-only';

/* =============================================================================
   THE TYPED DATA LAYER — the single seam between this site and the CMS.

   Every function here is SERVER-ONLY and runs at BUILD or REVALIDATE time, never
   per visitor request. `server-only` makes that a compile error rather than a
   convention: importing this from a 'use client' module fails the build.

   The ONE exception in the whole codebase is the contact form's POST, which
   happens in the browser and therefore does NOT live here.

   Backend downtime leaves the site serving its last good build.
   ========================================================================== */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/** An hour. A safety net, not the mechanism — publishing triggers an on-demand
 *  revalidation, and this is what catches a missed webhook. */
const REVALIDATE_SECONDS = 3600;

type FetchOptions = {
  tags: string[];
  /** When the CMS is unreachable at build time, return this instead of failing
   *  the whole build. Used only where an empty section degrades gracefully. */
  fallback?: unknown;
};

class CmsUnavailableError extends Error {
  constructor(path: string, status: number) {
    super(`CMS request failed: ${path} returned ${status}`);
    this.name = 'CmsUnavailableError';
  }
}

async function getJson<T>(path: string, options: FetchOptions): Promise<T> {
  if (!BASE) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and point it at the CMS.',
    );
  }

  const url = `${BASE.replace(/\/+$/, '')}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: options.tags },
      headers: { Accept: 'application/json' },
    });
  } catch (cause) {
    if (options.fallback !== undefined) return options.fallback as T;
    throw new Error(`Could not reach the CMS at ${url}.`, { cause });
  }

  if (response.status === 404) {
    if (options.fallback !== undefined) return options.fallback as T;
    throw new CmsUnavailableError(path, 404);
  }

  if (!response.ok) {
    if (options.fallback !== undefined) return options.fallback as T;
    throw new CmsUnavailableError(path, response.status);
  }

  const body = (await response.json()) as { data: T };
  return body.data;
}

/** Returns null for a 404 rather than throwing — for `/projects/[slug]`, where a
 *  missing slug must render notFound() rather than break the build. */
export async function getJsonOrNull<T>(path: string, options: FetchOptions): Promise<T | null> {
  try {
    return await getJson<T>(path, options);
  } catch (error) {
    if (error instanceof CmsUnavailableError && error.message.includes('404')) return null;
    throw error;
  }
}

export { getJson };
