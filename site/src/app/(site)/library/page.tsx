import type { Metadata } from 'next'
import { AreaHeader, LinkList } from '@/components/areas/Area'
import { pageMetadata } from '@/lib/seo'

/**
 * /library: the utility index (FE-11). Reference pages that support every area rather
 * than belonging to one. Credits (/library/credits) is built separately (FE-19).
 */

export const metadata: Metadata = pageMetadata({
  path: '/library',
  title: 'Library',
  description:
    'Reference pages for the whole site: the glossary, credits for the sources it draws on, who writes the site and what has changed.',
})

const ITEMS = [
  {
    href: '/glossary',
    title: 'Glossary',
    note: 'Every acronym and term the site uses, in plain spoken words, with the line to say in an interview.',
  },
  {
    href: '/library/credits',
    title: 'Credits',
    note: 'The sources behind the lessons and how each one is credited.',
  },
  {
    href: '/about',
    title: 'About',
    note: 'Who writes the site, how the material is made, and how to report a problem.',
  },
  {
    href: '/changelog',
    title: 'Changelog',
    note: 'What has changed on the site, newest first.',
  },
]

export default function LibraryPage() {
  return (
    <div className="py-12">
      <AreaHeader eyebrow="Library" title="Library">
        <p>Reference pages that support every area: terms, where the material comes from, and what has changed.</p>
      </AreaHeader>
      <div className="mt-8 -mx-2 max-w-3xl">
        <LinkList items={ITEMS} columns={1} />
      </div>
    </div>
  )
}
