import type { Metadata } from 'next'
import { AreaHeader, LinkList } from '@/components/areas/Area'

/**
 * /library: the utility index (FE-11). Reference pages that support every area rather
 * than belonging to one. Credits (/library/credits) is built separately (FE-19).
 */

export const metadata: Metadata = {
  title: 'Library',
  description:
    'Reference pages for the whole site: the glossary, the learning map, how the site works, and credits for the sources it draws on.',
}

const ITEMS = [
  {
    href: '/glossary',
    title: 'Glossary',
    note: 'Every acronym and term the site uses, in plain spoken words, with the line to say in an interview.',
  },
  {
    href: '/learning-map',
    title: 'Learning Map',
    note: 'How the practice, case studies and final-week review fit together, and what to open when.',
  },
  {
    href: '/guide',
    title: 'How to Use This Site',
    note: 'What each kind of page is for, how progress is saved in this browser, and where the material comes from.',
  },
  {
    href: '/library/credits',
    title: 'Credits',
    note: 'The sources behind the lessons and how each one is credited.',
  },
]

export default function LibraryPage() {
  return (
    <div className="py-12">
      <AreaHeader eyebrow="Library" title="Library">
        <p>Reference pages that support every area: terms, maps, how the site works, and where the material comes from.</p>
      </AreaHeader>
      <div className="mt-8 -mx-2 max-w-3xl">
        <LinkList items={ITEMS} columns={1} />
      </div>
    </div>
  )
}
