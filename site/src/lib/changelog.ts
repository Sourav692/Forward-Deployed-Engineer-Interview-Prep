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
    date: '2026-11-04',
    title: 'Staff AI System Design: a new course in Learn',
    summary:
      'The AI System Design group has a second track, T17 Staff AI System Design: Building an Enterprise AI Platform. It walks through building one enterprise AI platform in 13 stage modules, then a module of 13 architecture decision records, one per stage. Lessons carry browser labs you run on the page and Python labs you run locally from the course code on GitHub. The AI System Design round lists the course\'s staff-level questions, and the architect learning path recommends the course. Later tracks moved up one: Forward Deployed Engineering is now T18, Communication and Behavioural T19, Capstone and Portfolio T20. Links and saved progress are unchanged.',
  },
  {
    date: '2026-11-03',
    title: 'What\'s Inside on the homepage',
    summary:
      'The homepage\'s readiness list and its list of areas became one What\'s Inside block. It shows Learn, the casebook, practice and the interview area, each with its headline count, what it is for and how it is organised, then the eight Learn topic groups, with the groups still to come marked Coming soon.',
  },
  {
    date: '2026-11-02',
    title: 'Audit fixes: cleaner course pages, honest times, hidden answers',
    summary:
      'Fixes from the 2 November site audit. Behavioural answers keep their own wording, so no more "a approved and controlled". Course pages lose the last course lesson numbers, including the ones inside diagrams, and show notebook titles instead of file names. Credits lists the RAG & Agents Engineering course. Worksheets show the time they take to work, and paused pages show no time. Every lesson\'s Check Yourself answers stay hidden until you open them. Diagrams use British spelling, the AI System Design breadcrumb no longer repeats, and the orientation module is now "How the site works".',
  },
  {
    date: '2026-11-02',
    title: 'Story tags written for readers',
    summary:
      'The behavioural worksheets, answer keys and story bank tagged each sample story GROUNDED, PARTLY GROUNDED or NEEDS YOUR INPUT, notes on how much of each story came from the author\'s own material. They now read Example story, Add your own detail and Your story, and the story bank says what you need to add. The stories are unchanged.',
  },
  {
    date: '2026-11-02',
    title: 'No vendor platform named, and softer interview claims',
    summary:
      'The site no longer names Databricks or its products. Course lessons that mentioned them are reworded in vendor-neutral terms, three notebook-only course lessons that only run on that platform are off the site, and the hybrid-and-rerank lesson has a new title and URL (the old one redirects and keeps your progress). The behavioural answer keys tell the same stories in vendor-neutral terms. Course interview-question pages no longer claim to be in the style of named employers\' interviews.',
  },
  {
    date: '2026-11-02',
    title: 'Course module times include the notebook work',
    summary:
      'Module times are reading plus practice. Modules from the RAG & Agents Engineering course counted only a short lab allowance as practice and left their notebook work out, so they looked far smaller than modules that count their worksheets and builds. Their practice time now includes the notebook work, about two to six hours a module, and the AI Engineering group reads about 238 hours instead of 78. No lessons changed.',
  },
  {
    date: '2026-11-01',
    title: 'Track and module codes follow the Learn order',
    summary:
      'Learn tracks are now numbered T0 to T19 in the order the topic groups list them, so the AI Engineering group reads T2 to T15 and Production AI is T15. Modules inside each track are numbered in reading order. Earlier entries on this page use the old codes. Links and saved progress are unchanged.',
  },
  {
    date: '2026-11-01',
    title: 'AI Engineering: the RAG & Agents Engineering course',
    summary:
      'The AI Engineering group grew from three tracks to fourteen, about 78 hours, with the author\'s open-source RAG & Agents Engineering course. New tracks run from Python and provider APIs through prompt and context engineering, LangChain and LangGraph, ingestion, retrieval quality, agentic and self-correcting RAG, memory and multi-agent systems, MCP and A2A, GraphRAG and a capstone. RAG Foundations and Agent Foundations for RAG were rebuilt from the course\'s opening modules. Lessons carry interactive labs, animated diagrams, Check yourself questions and common mistakes, and link to the runnable notebooks in the course repository. The About page credits the course.',
  },
  {
    date: '2026-10-31',
    title: 'Classic designs agree with their cases, and audit fixes',
    summary:
      'The seven classic AI design lessons in Learn now give the same answers as their full cases in the casebook: the same caps, gates, cache rules and failure handling. A site audit then found small loose ends from this month\'s changes, now fixed. Casebook cards show the same reading time and level as the case page, worksheet and case twins are labelled the same way, previous and next skip modules that are not ready yet, and /interview links every mock interview.',
  },
  {
    date: '2026-10-31',
    title: 'Interview by round',
    summary:
      'The interview area now follows the rounds of a real loop, from the recruiter screen to the demo or take-home. Each round says what the interviewer tests and lists what to study in Learn, what to practise and the mock interview to run. The five topic hubs became rounds, and their old links redirect.',
  },
  {
    date: '2026-10-30',
    title: 'Learn by topic, on a wider page',
    summary:
      'Learn is now organised into eight topic groups, from Start here to Career, each with its own page of tracks, hours and progress. Groups still being written show as Coming soon cards with their planned topics. Every page now uses one wide layout with an Inter body and a reading column of up to 60rem, so lessons, cases and worksheets read the same way.',
  },
  {
    date: '2026-10-28',
    title: 'A new look, and cases as chapters',
    summary:
      'The home page, casebook, practice and interview areas share one editorial design. Each case now opens on an introduction and reads one part at a time, with a sidebar of its documents and parts, previous and next buttons, and a mark for each part you finish. The final-week review is grouped into six days.',
  },
  {
    date: '2026-10-12',
    title: 'Release B: level calibration, client simulations and rights',
    summary:
      'Every one of the 33 system designs now ends with a level calibration: what a Senior, a Staff and a Principal answer covers for that problem. Mock interviews gain five client simulations, each with a customer, an opening brief and hidden constraints to uncover, and one take-home brief with a scoring guide. The 12 system-design worksheets and six design pages that were derived from a book and a course have been rewritten in our own words, and the credits page now shows the rights status of every credited lesson.',
  },
  {
    date: '2026-10-12',
    title: 'Release B: one home and one name for every page',
    summary:
      'The 33 system designs now live under /design, and the worksheets and story bank under /practice. The final-week review is part of the site instead of separate HTML copies, and every old address redirects once to the new one. Pages use the same name in the menu, on the hub, in the breadcrumb and on the card, with no internal codes in titles. Designs and worksheets on the same problem link to each other, and /design and /practice can be filtered by theme, level and reading time. Every page shows one reading time, and module, track and path times are the sum of their parts. Diagrams fit their column and arrive as part of the page, long pages are split into parts of at most 2,500 words, and the text follows British spelling.',
  },
  {
    date: '2026-10-11',
    title: 'Release A: trust and first impression',
    summary:
      'A shorter header with Settings, Glossary and Library in the footer, and no Coming soon or On hold cards on the hubs. /start is now the one place to begin, with an "Interview this week?" shortcut, and paths no longer mark empty modules as required. Every lesson, design and worksheet shows its author, when it last changed and a Report an issue link; there are new About and Changelog pages. Repository paths, broken links and build footers are gone, unknown pages return a proper 404, every page has a share image, and long case pages load much faster.',
  },
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
