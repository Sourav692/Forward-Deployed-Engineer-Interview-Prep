/**
 * Copy deck for the Learn pages (UX-06). The source of truth for wording is
 * `.website_spec/reference/2026-10-05-learn-ux.md`; keep the two in step. British English,
 * buttons start with a verb, errors say what happened and what to do.
 */
export const COPY = {
  // Gap states
  partlyTitle: 'Partly ready',
  partlyLead: 'The lessons above are published. The rest of this module is still being written.',
  partlyComingSoon: (gap: string) => `Coming soon in this module: ${gap}`,
  comingSoonTitle: 'Coming soon',
  comingSoonLead:
    'This module has no lessons yet. The objective and scope below say what it will cover, and the related modules teach part of it today.',
  comingSoonNoRelated: 'No other module covers this topic yet. Check back after the next content update.',
  onHoldTitle: 'Paused, will return',
  onHoldLead:
    'This module is paused while its material is reworked. It will return; until then, the related modules below cover the nearest ground.',

  // Reading list
  readingListTitle: 'Lessons',
  seeAlsoAsMainTitle: 'Lessons',
  seeAlsoAsMainLead:
    'This module has no lessons of its own. Everything it teaches lives in other modules, so read these in order.',
  seeAlsoTitle: 'Also used in this module',
  seeAlsoLead: 'Lessons taught in another module that this one builds on.',
  liveLessonHint: 'Opens the practice page',
  emptyReadingList: 'No lessons are published for this module yet.',
  notebookOnlyTitle: 'Notebook-only lessons',
  notebookOnlyLead: 'These course lessons have no page here yet. Work through their notebooks on GitHub.',
  notebookOnlyOptional: 'optional',

  // Prerequisites
  prereqTitle: 'Finish these first',
  prereqOpenedTitle: 'Opened before its prerequisites',
  prereqBody:
    'This module builds on the modules below, so we suggest reading them first. You can still read it now. A module counts as complete when every lesson is read and confidence is rated 3 or more.',
  prereqOpenAnyway: 'Open anyway',
  prereqSatisfied: 'Prerequisites complete',

  // Lesson actions
  markRead: 'Mark read',
  markUnread: 'Mark unread',
  toastRead: 'Lesson marked read. Module progress updated.',
  bookmark: 'Bookmark',
  bookmarked: 'Bookmarked',
  notesLabel: 'Your notes on this module',
  notesHint: 'Saved in this browser when you leave the box.',
  notesSaved: 'Notes saved.',
  confidenceLegend: 'How confident are you with this module?',
  confidenceHint: '1 means "I could not explain it yet"; 5 means "I could teach it". Rate again any time.',
  confidenceNone: 'Not rated yet.',
  confidenceSaved: (v: number) => `Confidence set to ${v} of 5.`,

  // Errors and storage
  storageBlockedTitle: "Progress won't be saved in this browser.",
  storageBlockedBody: 'Storage is blocked (private window or site data turned off). You can still read everything.',
  saveFailed: "That didn't save. Storage may be full or blocked in this browser.",

  // Filters
  filterEmptyTitle: 'No tracks match these filters',
  filterEmptyBody: 'Clear a filter to see more tracks.',
  clearFilters: 'Clear filters',
} as const
