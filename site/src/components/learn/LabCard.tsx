import { buttonClass } from '@/components/ui'

/**
 * An interactive lab in a lesson (FE-06): the lab's title and a link that opens it in a new
 * tab. The lab is a static file under /labs/, copied from the RAG & Agents Engineering
 * course by the theory import. Framing it inside the lesson is Phase 2 (FE-10).
 */
export function LabCard({ src, title }: { src: string; title: string }) {
  return (
    <aside className="cb-lab-card" aria-label={`Interactive lab: ${title}`}>
      <p className="cb-label">Interactive lab</p>
      <p className="cb-lab-card__title">{title}</p>
      <p className="cb-lab-card__lead">It runs in your browser, in a new tab.</p>
      <a href={src} target="_blank" rel="noopener" className={buttonClass('secondary', 'mt-3')}>
        Open the lab<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </aside>
  )
}
