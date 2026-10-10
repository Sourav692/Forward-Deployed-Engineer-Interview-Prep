import { Diagram } from '@/components/Diagram'
import { formatMinutes, type LessonPage } from '@/lib/learn'
import { Byline } from '@/components/Byline'

/**
 * LessonReader (FE-07). A Server Component: the markdown was parsed at build time by
 * `parseReading` (the same `marked` pipeline as the live case-study pages), so the
 * HTML ships in the static page. Only ```mermaid fences become the client `Diagram`
 * island, which loads mermaid on demand.
 *
 * Under the title: the author and last-updated line, then reading time, the source
 * note ("From the FDE Handbook") and, for third-party material (`publish: 'credited'`),
 * the credit line.
 */
export function LessonReader({ page }: { page: LessonPage }) {
  const { lesson, doc, sourceNote, creditHtml } = page
  return (
    // `break-words` lets long unbroken tokens (file paths in inline code, URLs) wrap
    // instead of pushing the page sideways; tables and code blocks scroll in their own box.
    <article className="lesson-reading break-words" aria-labelledby="lesson-title">
      <header className="border-b border-border pb-5">
        <h1 id="lesson-title" className="text-balance">
          {lesson.title}
        </h1>
        <Byline updated={lesson.updated} />
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          {lesson.estMinutes ? <span>{formatMinutes(lesson.estMinutes)} read</span> : null}
          {lesson.estMinutes ? <span aria-hidden="true">·</span> : null}
          <span>{sourceNote}</span>
        </p>
        {creditHtml && (
          <p className="mt-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
            <span className="font-semibold text-text">Credit: </span>
            <span dangerouslySetInnerHTML={{ __html: creditHtml }} />
          </p>
        )}
      </header>

      <div className="mt-6 space-y-8">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24" aria-label={section.title ? undefined : 'Introduction'}>
            {section.title && <h2 className="mt-0" dangerouslySetInnerHTML={{ __html: section.title }} />}
            <div className="space-y-4">
              {section.chunks.map((chunk, i) =>
                chunk.kind === 'diagram' ? (
                  <Diagram key={i} code={chunk.code} />
                ) : (
                  <div key={i} className="prose reading" dangerouslySetInnerHTML={{ __html: chunk.html }} />
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
