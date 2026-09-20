/* =============================================================================
   PROJECTS — now sourced from the CMS.

   The literal array that used to live here is gone: the five records were
   migrated VERBATIM into the CMS (including every `[BRACKETED]` placeholder,
   byte for byte) and are now editable without a developer. That was the entire
   point of building the backend.

   This module survives as a thin re-export so existing import paths keep
   working. The types are UNCHANGED — every function still returns `Project`
   exactly as `src/types/content.ts` declares it.

   ⚠️ THE FUNCTIONS ARE NOW ASYNC. `getProject`, `usedCategories` and
   `featuredProjects` all hit the data layer, so their call sites must `await`.

   ⚠️ SERVER-ONLY. These may not be imported from a 'use client' module — the
   data layer enforces that at compile time. `ContactForm` used to import
   `projects` directly, which is exactly the violation this now prevents.
   ========================================================================== */

export {
  getProject,
  getProjects,
  getFeaturedProjects,
  usedCategories,
  categoryOrder,
  type ProjectCard,
} from '@/lib/api/projects';
