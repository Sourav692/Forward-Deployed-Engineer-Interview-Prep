/** The six areas (blueprint §9). Plain data so Server and Client Components can share it. */
export const AREAS = [
  { href: '/demo/start', label: 'Start', icon: 'M4 12l8-8 8 8M6 10v9h12v-9' },
  { href: '/demo/learn', label: 'Learn', icon: 'M4 5h7a3 3 0 013 3v11a2 2 0 00-2-2H4zM20 5h-7a3 3 0 00-3 3' },
  { href: '/demo/design', label: 'Design', icon: 'M4 4h7v7H4zM13 13h7v7h-7zM13 4h7v7h-7zM4 13h7v7H4z' },
  { href: '/demo/practice', label: 'Practice', icon: 'M5 19l4-1 10-10-3-3L6 15zM14 6l3 3' },
  { href: '/demo/interview', label: 'Interview', icon: 'M4 5h16v10H9l-5 4z' },
  { href: '/demo/progress', label: 'Progress', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
] as const
