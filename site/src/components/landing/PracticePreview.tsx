'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui'
import styles from './landing.module.css'

const WORKSHEET = '/practice/internal-knowledge-assistant'

// A shortened discovery exercise from the published knowledge-assistant worksheet.
// The score is the reader's judgement; this preview has no evaluator or storage.
const RUBRIC = [
  { value: 1, label: 'I jumped straight to tools.' },
  { value: 3, label: 'I named the users and a success measure.' },
  { value: 5, label: 'I connected the workflow, success measure, and risk boundary.' },
]

export function PracticePreview() {
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [needsAnswer, setNeedsAnswer] = useState(false)
  const input = useRef<HTMLTextAreaElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  function advance(next: number) {
    if (next === 1 && !answer.trim()) {
      setNeedsAnswer(true)
      input.current?.focus()
      return
    }
    setNeedsAnswer(false)
    if (next === 0) setScore(null)
    setStep(next)
    requestAnimationFrame(() => heading.current?.focus())
  }

  return (
    <section aria-label="Try a practice question" className={styles.practice}>
      <div className={styles.practiceTop}>
        <span className="text-base">A little practice, right here</span>
        <span className="text-sm text-muted">{String(step + 1).padStart(2, '0')} / 03</span>
      </div>
      <ol className={styles.practiceSteps} aria-label="Practice steps">
        {['Write', 'Compare', 'Score'].map((label, index) => (
          <li key={label} aria-current={step === index ? 'step' : undefined}>
            <span aria-hidden>{index + 1}</span>{label}
          </li>
        ))}
      </ol>
      <div className={styles.practiceBody}>
        <p className={styles.tag}>Internal knowledge assistant</p>
        <h2 ref={heading} tabIndex={-1} className="text-2xl focus:outline-none">
          {step === 0 ? 'Before you pick a model…' : step === 1 ? 'Compare the reasoning' : 'How strong was your answer?'}
        </h2>
        {step === 0 && (
          <>
            <p id="preview-prompt" className="mt-3 text-sm leading-relaxed text-muted">
              A customer wants an assistant for sensitive internal documents. What would you clarify first?
            </p>
            <label htmlFor="preview-answer" className="mt-5 block text-sm">Your first move</label>
            <textarea
              ref={input}
              id="preview-answer"
              value={answer}
              onChange={(event) => { setAnswer(event.target.value); setNeedsAnswer(false) }}
              rows={3}
              maxLength={1500}
              aria-describedby={`preview-prompt${needsAnswer ? ' preview-error' : ''}`}
              aria-invalid={needsAnswer || undefined}
              placeholder="I would first find out…"
              className={styles.answer}
            />
            {needsAnswer && <p id="preview-error" role="alert" className="mt-2 text-sm text-danger">Write a first thought before comparing.</p>}
            <Button onClick={() => advance(1)} className="mt-4 min-h-12 w-full">Compare with a strong answer</Button>
            <p className="mt-3 text-xs leading-relaxed text-muted">A quick preview. Your draft stays on this page.</p>
          </>
        )}
        {step === 1 && (
          <>
            <div className="mt-4 border-l-2 border-accent pl-3">
              <p className="text-xs font-semibold text-muted">A strong first move</p>
              <p className="mt-2 text-sm leading-relaxed">
                “I would ask who needs the answer, what task they are trying to finish, which sources they can access,
                and what a successful pilot would prove. Then I would agree on the risk boundary before choosing tools.”
              </p>
            </div>
            <div className="mt-4 rounded-md bg-surface-2 p-3">
              <p className="text-xs font-semibold text-muted">Your first move</p>
              <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm">{answer}</p>
            </div>
            <Button onClick={() => advance(2)} className="mt-4 min-h-11 w-full">Score my answer</Button>
            <Button variant="ghost" onClick={() => advance(0)} className="mt-1 min-h-11 w-full">Edit my answer</Button>
          </>
        )}
        {step === 2 && (
          <>
            <fieldset className="mt-4">
              <legend className="text-sm text-muted">Pick the description that fits. This is your self-assessment.</legend>
              <div className="mt-3 grid gap-2">
                {RUBRIC.map((item) => (
                  <label key={item.value} className={styles.scoreOption}>
                    <input type="radio" name="preview-score" value={item.value} checked={score === item.value} onChange={() => setScore(item.value)} />
                    <span className="text-sm">{item.value}/5</span>
                    <span className="text-sm leading-snug">{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p aria-live="polite" className="mt-3 text-sm text-muted">
              {score === null ? 'Look for the decision and its reason, not matching words.' : `Your self-score: ${score}/5. Try the full case to practise the next decision.`}
            </p>
            <a href={WORKSHEET} className="mt-4 inline-flex min-h-11 items-center text-base text-accent underline">Open the full worksheet</a>
            <Button variant="ghost" onClick={() => advance(0)} className="mt-1 min-h-11 w-full">Try again</Button>
          </>
        )}
      </div>
    </section>
  )
}
