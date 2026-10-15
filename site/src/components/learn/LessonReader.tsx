import { Diagram } from '@/components/Diagram'
import { formatMinutes, type LessonPage } from '@/lib/learn'
import { toPlainText, type ReadingSection } from '@/lib/reading'
import { Byline } from '@/components/Byline'
import { LessonTabs } from '@/components/learn/LessonTabs'
import { TwinLinks } from '@/components/PageIntro'
import type { TwinLink } from '@/lib/twins'
import type { ExplorerData } from '@/lib/explorers/types'
import { LessonExperience } from '@/components/explorers/LessonExperience'

/**
 * A final-week review's "One-Page Memory Card" H2 opens a second tab, Recall card (owner
 * decision, ENH-18), so the card reads as a page of its own. Its panel id `recall-card` is
 * where the retired memory-card pages redirect. Sections after the card (Sources) show
 * under both tabs.
 */
const RECALL_CARD = /^One-Page Memory Card\b/

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
export function LessonReader({ page, twins = [], explorer }: { page: LessonPage; twins?: TwinLink[]; explorer?: ExplorerData | null }) {
  const { lesson, doc, sourceNote, creditHtml } = page
  const card = doc.sections.findIndex((s) => s.title && RECALL_CARD.test(s.title))
  const sourceLinks = { ...explorer?.readingLinks, ...Object.fromEntries(doc.sections.filter((s) => s.title).map((s) => [toPlainText(s.title!), `#${s.id}`])) }
  return (
    // `break-words` lets long unbroken tokens (file paths in inline code, URLs) wrap
    // instead of pushing the page sideways; tables and code blocks scroll in their own box.
    <article className={`lesson-reading break-words ${explorer ? 'max-w-none' : ''}`} aria-labelledby="lesson-title">
      <header className={`border-b border-border pb-5 ${explorer ? 'max-w-[68ch]' : ''}`}>
        <h1 id="lesson-title" className="text-balance">
          {lesson.title}
        </h1>
        <Byline updated={lesson.updated} report={{ title: lesson.title, path: lesson.href }} />
        <TwinLinks links={twins} />
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          {lesson.estMinutes ? <span>{formatMinutes(lesson.estMinutes)} read</span> : null}
          {lesson.estMinutes && sourceNote ? <span aria-hidden="true">·</span> : null}
          {sourceNote && <span>{sourceNote}</span>}
        </p>
        {creditHtml && (
          <p className="mt-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
            <span className="font-semibold text-text">Credit: </span>
            <span dangerouslySetInnerHTML={{ __html: creditHtml }} />
          </p>
        )}
      </header>

      {explorer ? <LessonExperience data={explorer} sourceLinks={sourceLinks}><div className="max-w-[68ch]"><Sections sections={doc.sections} /></div></LessonExperience> : <div className="mt-6">
        {card > 0 ? (
          <>
            <LessonTabs
              label="Review and recall card"
              tabs={[
                { id: 'review', label: 'Review', panel: <Sections sections={doc.sections.slice(0, card)} /> },
                { id: 'recall-card', label: 'Recall card', panel: <Sections sections={[doc.sections[card]]} /> },
              ]}
            />
            <div className="mt-8">
              <Sections sections={doc.sections.slice(card + 1)} />
            </div>
          </>
        ) : (
          <Sections sections={doc.sections} />
        )}
      </div>}
    </article>
  )
}

function Sections({ sections }: { sections: ReadingSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
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
  )
}
