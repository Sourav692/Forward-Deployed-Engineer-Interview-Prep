import type { Metadata } from 'next'
import { CHANGELOG } from '@/lib/changelog'
import { formatDate } from '@/lib/editorial'
import { pageMetadata } from '@/lib/seo'

/** /changelog (audit check PR-06): what changed on the site, newest first, from `changelog.ts`. */

export const metadata: Metadata = pageMetadata({
  path: '/changelog',
  title: 'Changelog',
  description: 'What has changed on Forward Deployed, newest first: new features, new content and larger rewrites.',
})

export default function ChangelogPage() {
  return (
    <div className="py-8 sm:py-10">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">Changelog</h1>
        <p className="mt-3 text-base text-muted">New features, new content and larger rewrites, newest first.</p>
      </header>
      <ol className="flex max-w-3xl flex-col gap-6">
        {CHANGELOG.map((entry) => (
          <li key={`${entry.date}-${entry.title}`} className="border-l-2 border-border pl-4">
            <p className="text-[0.8125rem] text-subtle">
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            </p>
            <h2 className="mt-0.5 text-base font-semibold">{entry.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{entry.summary}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
