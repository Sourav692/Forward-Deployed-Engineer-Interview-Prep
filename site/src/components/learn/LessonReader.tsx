import { Diagram } from '@/components/Diagram'
import { LabCard } from '@/components/learn/LabCard'
import { formatMinutes, type LessonPage } from '@/lib/learn'
import { toPlainText, type ReadingSection } from '@/lib/reading'
import { LessonTabs } from '@/components/learn/LessonTabs'
import type { TwinLink } from '@/lib/twins'
import type { ExplorerData } from '@/lib/explorers/types'
import { PageHead } from '@/components/editorial/PageHead'
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
 *
 * The head is the Editorial PageHead, tagged with the area (`tag`: Learn or Interview),
 * with the reading time and source as a ruled spec line.
 */
export function LessonReader({ page, twins = [], explorer, tag }: { page: LessonPage; twins?: TwinLink[]; explorer?: ExplorerData | null; tag: string }) {
  const { lesson, doc, sourceNote, creditHtml } = page
  const card = doc.sections.findIndex((s) => s.title && RECALL_CARD.test(s.title))
  const sourceLinks = { ...explorer?.readingLinks, ...Object.fromEntries(doc.sections.filter((s) => s.title).map((s) => [toPlainText(s.title!), `#${s.id}`])) }
  return (
    // `break-words` lets long unbroken tokens (file paths in inline code, URLs) wrap
    // instead of pushing the page sideways; tables and code blocks scroll in their own box.
    <article className={`lesson-reading break-words ${explorer ? 'max-w-none' : ''}`} aria-labelledby="lesson-title">
      <PageHead
        tag={tag}
        title={lesson.title}
        titleId="lesson-title"
        facts={[
          ...(lesson.estMinutes ? [{ term: 'Reading time', value: formatMinutes(lesson.estMinutes) }] : []),
          ...(sourceNote ? [{ term: 'Source', value: sourceNote }] : []),
        ]}
        updated={lesson.updated}
        twins={twins}
        report={{ title: lesson.title, path: lesson.href }}
      >
        {creditHtml && (
          <p className="mt-3 text-sm text-muted">
            <span className="font-semibold text-text">Credit: </span>
            <span dangerouslySetInnerHTML={{ __html: creditHtml }} />
          </p>
        )}
      </PageHead>

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
              ) : chunk.kind === 'lab' ? (
                <LabCard key={i} src={chunk.src} title={chunk.title} />
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
