/**
 * Retired lesson keys for T1 (engineering-foundations), merged into `RENAMED` in curriculum.ts.
 * Key: `<moduleSlug>/<lessonSlug>` of a lesson that was published and is now retired.
 * Value: the `<moduleSlug>/<lessonSlug>` that now teaches it, or `null` when withdrawn.
 * next.config.ts turns every entry into a permanent redirect. One file per track keeps
 * parallel consolidation PRs from editing the same lines.
 */
export const RENAMED_T1: Record<string, string | null> = {
  // T1.2 consolidated into seven lessons (specs/consolidation/T0-T1-T9.md).
  'apis-and-backend/module-10-backend-fastapi-deployment': 'apis-and-backend/keep-the-request-path-free',
  'apis-and-backend/caching-streaming-cicd-buildvsbuy': 'apis-and-backend/cache-answers-without-serving-wrong-ones',
  // T1.4 consolidated into seven lessons.
  'cloud-containers-deployment/module-10-deployment-and-operations':
    'cloud-containers-deployment/package-the-service-and-keep-secrets-out',
}
