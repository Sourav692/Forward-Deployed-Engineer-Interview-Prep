/**
 * Every redirect the site serves, in one list (ENH-15, owner decision 6).
 *
 * `next.config.ts` returns `REDIRECTS` from `redirects()`. `check:curriculum` fails when
 * one entry's destination is another entry's source (a chain), and `check:routes` requests
 * every fixed source and expects one 308 (307 when temporary) to a page that returns 200.
 *
 * Rules:
 * - Never drop an entry: bookmarks and activity entries store an `href`, and they keep
 *   working only through these redirects.
 * - Point at the item's own new page, never at a hub or the home page unless that page
 *   is its real home.
 * - No chains: when a page moves again, update every entry that pointed at it.
 *
 * Order matters (Next.js applies the first match): lesson renames, then whole areas,
 * then retired modules and one-off pages.
 *
 * Imported by `next.config.ts` and the check scripts, so it has no runtime imports.
 */
import { MODULES, RENAMED, RETIRED_MODULES } from './curriculum.ts'
import { AREA_TRACKS, curriculumHref } from './curriculum-href.ts'

export type Redirect = { source: string; destination: string; permanent: boolean }

const trackOf = new Map(MODULES.map((m) => [m.slug, m.track]))

/**
 * Lesson URLs retired by a consolidation, derived from RENAMED in src/lib/curriculum.ts
 * (one file per track in src/lib/consolidation/). A retired lesson redirects to the
 * lesson that now teaches it, or to its module page when it was withdrawn (`null`).
 */
function lessonRedirects(): Redirect[] {
  const resolveKey = (key: string) => {
    const [mod, lesson] = key.split('/')
    const track = trackOf.get(mod)
    if (!track) throw new Error(`RENAMED key "${key}" names an unknown module`)
    return { track, mod, lesson }
  }
  const out: Redirect[] = []
  for (const [from, to] of Object.entries(RENAMED)) {
    // A retired module's lessons go with it; retiredModuleRedirects sends the module on.
    if (from.split('/')[0] in RETIRED_MODULES) continue
    const src = resolveKey(from)
    const dst = resolveKey(to ?? from.split('/')[0])
    const destination = curriculumHref(dst.track, dst.mod, dst.lesson)
    out.push({ source: curriculumHref(src.track, src.mod, src.lesson), destination, permanent: true })
    // A track that moved out of /learn keeps its old /learn URL, sent straight to the
    // final page so the redirect never chains through the area rule below.
    if (src.track in AREA_TRACKS) {
      const source = [`/learn/${src.track}`, src.mod, src.lesson].filter(Boolean).join('/')
      out.push({ source, destination, permanent: true })
    }
  }
  return out
}

/**
 * Tracks served by their own area (src/lib/curriculum-href.ts) used to live under
 * /learn/<track>. Their old URLs redirect to the area, keeping the module and lesson.
 * The bare track URL gets its own rule: `:path*` matching nothing would leave a
 * trailing slash (`/interview/`) and cost a second redirect.
 */
const areaRedirects = (): Redirect[] =>
  Object.entries(AREA_TRACKS).flatMap(([track, base]) => [
    { source: `/learn/${track}`, destination: base, permanent: true },
    { source: `/learn/${track}/:path+`, destination: `${base}/:path+`, permanent: true },
  ])

/**
 * Company-oriented prep (module 16) is unpublished while its packs move to the Company
 * Prep area. Temporary (307), because the module URLs may come back.
 */
const companyPrepRedirects: Redirect[] = [
  { source: '/modules/16-company-oriented-prep', destination: '/company-prep', permanent: false },
  { source: '/modules/16-company-oriented-prep/:path*', destination: '/company-prep', permanent: false },
]

/** Removed modules (RETIRED_MODULES in curriculum.ts) redirect to the module that took them over. */
const retiredModuleRedirects = (): Redirect[] =>
  Object.entries(RETIRED_MODULES).map(([from, to]) => ({
    source: curriculumHref(trackOf.get(to)!, from),
    destination: curriculumHref(trackOf.get(to)!, to),
    permanent: true,
  }))

/**
 * The leadership-principle and hiring-manager worksheets were merged into the FDE
 * competency worksheets (T7.2, The behavioural round). Each old worksheet goes to the new
 * one that holds most of its questions.
 */
const BEHAVIOURAL_MODULE = '/modules/14-behavioural-and-leadership-round'
const RETIRED_BEHAVIOURAL_WORKSHEETS: Record<string, string> = {
  'hiring-manager/ambiguity-and-discovery': 'customer-focus-and-discovery',
  'hiring-manager/delivery-under-pressure': 'delivery-under-pressure',
  'hiring-manager/pushback-and-saying-no': 'pushback-and-saying-no',
  'hiring-manager/scale-beyond-self': 'scale-beyond-yourself',
  'hiring-manager/stakeholder-influence': 'communication-and-influence',
  'leadership-principles/attracts-and-retains-talent': 'leading-people',
  'leadership-principles/communicates-with-clarity': 'communication-and-influence',
  'leadership-principles/creates-a-culture-of-accountability': 'leading-people',
  'leadership-principles/customer-obsession': 'customer-focus-and-discovery',
  'leadership-principles/develops-people': 'leading-people',
  'leadership-principles/embraces-adversity': 'ownership-standards-and-failure',
  'leadership-principles/engenders-trust': 'communication-and-influence',
  'leadership-principles/focuses-on-outcomes': 'ownership-standards-and-failure',
  'leadership-principles/makes-good-decisions-quickly': 'delivery-under-pressure',
  'leadership-principles/never-stops-learning-and-growing': 'ownership-standards-and-failure',
  'leadership-principles/ownership': 'ownership-standards-and-failure',
  'leadership-principles/resourceful': 'scale-beyond-yourself',
  'leadership-principles/sets-high-standards': 'ownership-standards-and-failure',
  'leadership-principles/staff-level-and-cross-cutting': 'scale-beyond-yourself',
}

const behaviouralRedirects: Redirect[] = Object.entries(RETIRED_BEHAVIOURAL_WORKSHEETS).map(([from, to]) => ({
  source: `${BEHAVIOURAL_MODULE}/${from}`,
  destination: `${BEHAVIOURAL_MODULE}/fde-competencies/${to}`,
  permanent: true,
}))

export const REDIRECTS: Redirect[] = [
  ...lessonRedirects(),
  ...areaRedirects(),
  ...companyPrepRedirects,
  ...retiredModuleRedirects(),
  ...behaviouralRedirects,
  // /start is the one onboarding page (ENH-11); the two pages it absorbed redirect.
  { source: '/guide', destination: '/start', permanent: true },
  { source: '/learning-map', destination: '/start', permanent: true },
  // Hubs have no index page of their own: /interview lists them (FE-18).
  { source: '/interview/hubs', destination: '/interview', permanent: false },
  // The /demo prototype was retired once production covered it (FE-19). Its
  // fd:demo:v1 progress is not migrated (plan §15 Q12).
  { source: '/demo', destination: '/', permanent: true },
  { source: '/demo/:path*', destination: '/', permanent: true },
]
