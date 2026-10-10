/**
 * What changed on the site, newest first (audit check PR-06), rendered by /changelog.
 * Add one entry when a release ships; the dates are the day the work merged.
 */

export type ChangelogEntry = {
  /** `YYYY-MM-DD`. */
  date: string
  title: string
  summary: string
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-10-10',
    title: 'Module checkpoints',
    summary:
      'Modules can end with a short checkpoint quiz. A pass counts towards interview readiness, and a fail puts the module in your revision queue. The retrieval module (hybrid search, reranking and query transformation) is the first to have one.',
  },
  {
    date: '2026-10-10',
    title: 'Evidence for high mock scores',
    summary:
      'A mock interview dimension scored 4 or 5 now needs a line of evidence from your answer, so the scorecard rewards what you said rather than how the round felt.',
  },
  {
    date: '2026-10-10',
    title: 'Progress dashboard',
    summary:
      'The progress page shows what to do next, a revision queue, progress per track, an interview readiness score built from the inputs you have measured, and your recent activity and bookmarks. Everything stays in this browser.',
  },
  {
    date: '2026-10-10',
    title: 'Interview topic hubs',
    summary:
      'Five hubs group the practice by what the interviewer tests: technical foundations, AI and machine learning, AI systems design, forward deployed engineering, and behavioural and communication. Each lists its question lessons, timed rounds and the modules behind them.',
  },
  {
    date: '2026-10-10',
    title: 'Settings: export, import and reset',
    summary:
      'Export your progress to a file, import it in another browser, or reset it. Imports are checked before anything is replaced.',
  },
  {
    date: '2026-10-10',
    title: 'Mock interview timer and scorer',
    summary:
      'The scenario mock lessons have a round timer and a scorer for the interviewer rubric, so a practice round runs to time and ends with a score you can track.',
  },
  {
    date: '2026-10-07',
    title: 'Interview area and a new behavioural round',
    summary:
      'Interview practice, mock interviews and the final-week review moved to their own area at /interview. The behavioural material became one round with FDE competency worksheets and answer keys. The home page gained a practice preview and a scroll-through journey from discovery to architecture.',
  },
  {
    date: '2026-10-05',
    title: 'Lessons consolidated',
    summary:
      'The concept tutorials were rewritten into consolidated lessons: one sequence per module, one fixed lesson shape, and old lesson URLs redirected to their replacements.',
  },
  {
    date: '2026-10-05',
    title: 'Launch',
    summary:
      'The first production release: the Learn curriculum with progress saved in your browser, a path picker on /start, the casebook of worked designs, practice worksheets with model answers, search, and the final-week review.',
  },
]
