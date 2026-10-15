/**
 * Self-check for the learner store (`src/lib/progress/store.ts`): keys, the import
 * guard, export/import round trip, reset, and the module and track rollups.
 *
 * Runs under plain `node` via native TypeScript type stripping, with an in-memory
 * localStorage stub standing in for the browser:
 *   npm run check:store
 */

// ── Browser stub (must exist before the store is used) ─────────────────────

class MemoryStorage {
  map = new Map<string, string>()
  get length() {
    return this.map.size
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null
  }
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v))
  }
  removeItem(k: string) {
    this.map.delete(k)
  }
  clear() {
    this.map.clear()
  }
}

const storage = new MemoryStorage()
const win = new EventTarget() as EventTarget & { localStorage: MemoryStorage }
win.localStorage = storage
;(globalThis as unknown as { window: typeof win }).window = win

let events = 0
win.addEventListener('fd:progress', () => events++)

const store = await import('../src/lib/progress/store.ts')
const { MODULES, LESSONS } = await import('../src/lib/curriculum.ts')
const { studyTime } = await import('../src/lib/study-time.ts')

let failures = 0
let passes = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) passes++
  else {
    failures++
    console.error(`✗ ${name}\n    expected ${JSON.stringify(expected)}\n    got      ${JSON.stringify(actual)}`)
  }
}
const NOW = Date.parse('2026-10-05T12:00:00Z')

// ── Storage probe ──────────────────────────────────────────────────────────

check('storage available with stub', store.storageAvailable(), true)
check('probe key cleaned up', storage.getItem('fd:v1:probe'), null)

// ── Keys and records ───────────────────────────────────────────────────────

const mod = MODULES.find((m) => m.lessons.length >= 2)!
const [l1, l2] = mod.lessons
store.markLessonRead(mod.slug, l1, NOW)
check('lesson key shape', storage.getItem(`fd:v1:learn:lesson:${mod.slug}/${l1}`), JSON.stringify({ readAt: '2026-10-05T12:00:00.000Z' }))
check('lesson read', store.isLessonRead(mod.slug, l1), true)
check('other lesson unread', store.isLessonRead(mod.slug, l2), false)
check('fd:progress event fired', events > 0, true)
check('lesson-read logged', store.listActivity()[0].kind, 'lesson-read')

store.setConfidence(mod.slug, 4, NOW)
store.setNotes(mod.slug, 'Revise the trade-offs', NOW)
store.openAnyway(mod.slug, NOW)
const rec = store.getModuleRecord(mod.slug)
check('module record confidence', rec.confidence, [{ value: 4, at: '2026-10-05T12:00:00.000Z' }])
check('module record notes', rec.notes, 'Revise the trade-offs')
check('module record opened anyway', rec.openedAnywayAt, '2026-10-05T12:00:00.000Z')
check('confidence out of range rejected', store.setConfidence(mod.slug, 9 as 5, NOW), false)

store.choosePath({ pathId: 'fde', weeklyHours: 8 }, NOW)
check('path stored', store.getPath(), { pathId: 'fde', weeklyHours: 8, chosenAt: '2026-10-05T12:00:00.000Z' })
storage.setItem('fd:v1:scores:core/internal-knowledge-assistant', JSON.stringify({ r1: 3, r2: 5 }))
check('readKind returns live worksheet values by key', store.readKind('scores'), { 'core/internal-knowledge-assistant': { r1: 3, r2: 5 } })
storage.removeItem('fd:v1:scores:core/internal-knowledge-assistant')
check('weekly hours change keeps the path', [store.setWeeklyHours(12), store.getPath()?.weeklyHours, store.getPath()?.pathId], [true, 12, 'fde'])
store.setWeeklyHours(8)

check('bookmark added', store.toggleBookmark({ kind: 'lesson', itemId: `${mod.slug}/${l1}` }, NOW), true)
check('bookmark listed with id', store.listBookmarks().map((b) => b.id), [`lesson:${mod.slug}/${l1}`])
check('bookmark removed', store.toggleBookmark({ kind: 'lesson', itemId: `${mod.slug}/${l1}` }, NOW), false)
check('bookmarks empty', store.listBookmarks().length, 0)

for (let i = 0; i < 250; i++) store.logActivity({ kind: 'note-saved', itemId: `x${i}` }, NOW + i)
check('activity capped at 200', store.listActivity().length, 200)
check('activity newest first', store.listActivity()[0].itemId, 'x249')

// ── Rollups ────────────────────────────────────────────────────────────────

const expected = 1 / mod.lessons.length
check('module progress: equal weights without estimates', store.moduleProgress(mod.slug), {
  fraction: expected,
  lessonsRead: 1,
  lessonsTotal: mod.lessons.length,
})
// Give the first lesson an estimate: unknown lessons then weigh the mean of known ones.
const lesson1 = LESSONS.find((l) => l.slug === l1)!
lesson1.estMinutes = 30
check('module progress: one estimate, others weigh the mean', store.moduleProgress(mod.slug).fraction, expected)
const lesson2 = LESSONS.find((l) => l.slug === l2)!
lesson2.estMinutes = 90
const rest = mod.lessons.length - 2
check(
  'module progress: weighted by minutes',
  store.moduleProgress(mod.slug).fraction,
  30 / (30 + 90 + rest * 60),
)
delete lesson1.estMinutes
delete lesson2.estMinutes
check(
  'module progress: minutes override from the manifest',
  store.moduleProgress(mod.slug, { [l1]: 30, [l2]: 90 }).fraction,
  30 / (30 + 90 + rest * 60),
)
store.markLessonUnread(mod.slug, l1)
check('unread removes key', store.isLessonRead(mod.slug, l1), false)
check('module progress zero', store.moduleProgress(mod.slug).fraction, 0)
for (const l of mod.lessons) store.markLessonRead(mod.slug, l, NOW)
check('module progress complete', store.moduleProgress(mod.slug).fraction, 1)
check('unknown module', store.moduleProgress('no-such-module'), { fraction: 0, lessonsRead: 0, lessonsTotal: 0 })

const trackModules = MODULES.filter((m) => m.track === mod.track && m.lessons.length > 0)
// Without lesson minutes every module weighs the same; with them, by study time (ENH-22).
const tp = store.trackProgress(mod.track)
check('track progress: equal module weights without minutes', Math.abs(tp.fraction - 1 / trackModules.length) < 1e-9, true)
const tenEach = Object.fromEntries(LESSONS.map((l) => [l.slug, 10]))
const weight = (m: (typeof MODULES)[number]) => studyTime(m, tenEach).total || 1
const trackWeight = trackModules.reduce((s, m) => s + weight(m), 0)
check(
  'track progress weighted by study time',
  Math.abs(store.trackProgress(mod.track, tenEach).fraction - weight(mod) / trackWeight) < 1e-9,
  true,
)
check('track lessons read', tp.lessonsRead, mod.lessons.length)

// Reading a Casebook case must not change the Learn track's completion denominator
// or fraction, while its existing read-state key must still work.
const designBeforeCase = store.trackProgress('ai-systems-design')
const library = MODULES.find((m) => m.slug === 'scenario-library')!
const caseLesson = library.lessons[0]
store.markLessonRead(library.slug, caseLesson, NOW)
check('case read state remains available', store.isLessonRead(library.slug, caseLesson), true)
check('casebook is outside Learn track progress', store.trackProgress('ai-systems-design'), designBeforeCase)
store.markLessonUnread(library.slug, caseLesson)

// ── Export, import guard, reset ────────────────────────────────────────────

storage.setItem('fd:v1:answers:t1/s1', JSON.stringify({ a: 'live worksheet answer' }))
storage.setItem('fd:v1:theme', '"dark"')
storage.setItem('other-app:key', '"keep me"')
const exported = store.exportProgress(NOW)
check('export envelope', [exported.app, exported.version, exported.exportedAt], ['forward-deployed', 1, '2026-10-05T12:00:00.000Z'])
check('export includes live worksheet keys', 'fd:v1:answers:t1/s1' in exported.data, true)
check('export excludes other apps', 'other-app:key' in exported.data, false)
check('export values are raw strings', Object.values(exported.data).every((v) => typeof v === 'string'), true)
const file = JSON.stringify(exported)

const err = (json: string) => {
  const r = store.checkImport(json)
  return r.ok ? 'ok' : r.error
}
const wrap = (o: Record<string, unknown>) => JSON.stringify({ app: 'forward-deployed', version: 1, exportedAt: '', data: {}, ...o })
check('guard accepts own export', err(file), 'ok')
check('guard rejects invalid JSON', err('{not json').startsWith('The file is not valid JSON'), true)
check('guard rejects non-object', err('[]').startsWith('The file does not contain a progress export'), true)
check('guard rejects wrong app', err(wrap({ app: 'other' })).startsWith('The file was not exported from Forward Deployed'), true)
check('guard rejects wrong version', err(wrap({ version: 2 })).includes('export version 2'), true)
check('guard rejects unknown top-level field', err(wrap({ extra: 1 })).includes('unexpected field "extra"'), true)
check('guard rejects key outside fd:v1', err(wrap({ data: { 'evil:key': '1' } })).includes('"evil:key"'), true)
check('guard rejects bare prefix lookalike', err(wrap({ data: { 'fd:v2:x': '1' } })).includes('"fd:v2:x"'), true)
check('guard rejects non-string value', err(wrap({ data: { 'fd:v1:path': { pathId: 'x' } } })).includes('is not text'), true)
check('guard rejects damaged value', err(wrap({ data: { 'fd:v1:path': '{oops' } })).includes('is damaged'), true)
check('guard rejects missing data', err(JSON.stringify({ app: 'forward-deployed', version: 1 })).startsWith('The file has no progress data'), true)
check('guard rejects over 1 MB', err(wrap({ data: { 'fd:v1:big': JSON.stringify('x'.repeat(1024 * 1024)) } })).startsWith('The file is larger than 1 MB'), true)

const before = storage.getItem('fd:v1:path')
const rejected = store.importProgress(wrap({ app: 'other', data: { 'fd:v1:path': '"y"' } }))
check('rejected import changes nothing', [rejected.ok, storage.getItem('fd:v1:path')], [false, before])

store.resetProgress()
check('reset removes progress', store.getPath(), null)
check('reset removes live worksheet keys', storage.getItem('fd:v1:answers:t1/s1'), null)
check('reset keeps theme', storage.getItem('fd:v1:theme'), '"dark"')
check('reset keeps other apps', storage.getItem('other-app:key'), '"keep me"')

storage.setItem('fd:v1:learn:lesson:stale/lesson', '{"readAt":"x"}')
const imported = store.importProgress(file)
check('import succeeds', imported.ok, true)
check('import restores path', store.getPath()?.pathId, 'fde')
check('import restores worksheet answers', storage.getItem('fd:v1:answers:t1/s1'), JSON.stringify({ a: 'live worksheet answer' }))
check('import replaces stale keys', storage.getItem('fd:v1:learn:lesson:stale/lesson'), null)
const sorted = (d: Record<string, string>) => Object.entries(d).sort(([a], [b]) => a.localeCompare(b))
check('round trip is identical', sorted(store.exportProgress(NOW).data), sorted(exported.data))

console.log(`${passes} passed, ${failures} failed`)
if (failures) process.exit(1)
