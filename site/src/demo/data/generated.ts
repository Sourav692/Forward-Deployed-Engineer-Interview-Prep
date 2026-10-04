/**
 * Template-built sample content, derived from each module's blueprint fields.
 *
 * Hand-written lessons exist for T2, T4, T5, T6 and one browsable module per other
 * track. Every other module still needs a lesson, an exercise and a checkpoint so no
 * screen in the prototype is a dead end; these generators provide them. The output is
 * deliberately generic and labelled as sample content.
 */
import type { Assessment, AssessmentItem, Exercise, Lesson, Module } from '../types'
import { MODULES, SECTIONS } from './curriculum'

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const deliverable = (m: Module) => (m.outcomes[1] ?? m.objective).replace(/^Deliver:\s*/, '')
const probe = (m: Module) => m.why.match(/“(.+)”/)?.[1] ?? `How would you apply ${m.title}?`

export function generatedLesson(m: Module): Lesson {
  const section = SECTIONS.find((s) => s.id === m.sectionId)
  const mistake = m.commonMistakes[0] ?? 'Skipping the fundamentals'
  return {
    id: `${m.id}-l1`,
    moduleId: m.id,
    order: 1,
    title: `${m.title}: The Core Idea`,
    tagline: `Going deep on ${lower(m.title)} pays off in interviews, but only once the basics it depends on are solid.`,
    readingMin: 5,
    objectives: [m.objective, `State the scope: ${lower(m.scope)}`, `Explain what “${probe(m)}” is really testing`],
    sections: [
      {
        heading: 'Start from the objective',
        body: `This module exists so you can ${lower(m.objective)}. Keep the boundary in view: ${lower(m.scope)}. Anything outside that boundary is covered by a related module, so resist the urge to learn it here. ${section ? `It sits in the ${section.title} section, whose purpose is simple: ${lower(section.purpose)}.` : ''}`,
      },
      {
        heading: 'Practise it out loud',
        body: `Interviewers rarely ask for definitions. They ask questions like “${probe(m)}” and listen for structure, a stated trade-off and a concrete number. Answer in three moves: name the constraint, choose an option, and say what would change your mind. Then rehearse the same answer in under two minutes.`,
      },
    ],
    workedExample: {
      title: 'A two-minute answer',
      body: `A candidate preparing for a regional insurer’s interview loop takes the prompt “${probe(m)}”. They open with the constraint that matters most to the customer, pick one approach, name the cost of that choice, and close with the metric they would watch in the first two weeks. The answer lands in 100 seconds and leaves room for follow-ups.`,
    },
    warning: `The most common mistake here: ${lower(mistake)}. Interviewers notice it in the first minute.`,
    takeaways: [
      `Lead with the objective: ${lower(m.objective)}.`,
      `Stay inside the scope: ${lower(m.scope)}.`,
      `Prove it with the deliverable: ${lower(deliverable(m))}.`,
    ],
    checkYourself: [
      `What is this module’s objective, in one sentence?`,
      `What does “${lower(mistake)}” look like in a real answer, and how do you avoid it?`,
      `How would you answer “${probe(m)}” in under two minutes?`,
    ],
    referenceIds: ['ref-canonical-handbook'],
  }
}

export function generatedExercise(m: Module): Exercise {
  return {
    id: `${m.id}-ex1`,
    moduleId: m.id,
    title: deliverable(m),
    required: true,
    difficulty: m.estMinutes >= 300 ? 'hard' : m.estMinutes >= 150 ? 'medium' : 'easy',
    estMinutes: Math.max(20, Math.round(m.estMinutes / 4 / 5) * 5),
    skillIds: m.skillIds,
    instructions: [
      `Read the lessons for ${m.code} first.`,
      `Produce this deliverable: ${lower(deliverable(m))}.`,
      `Write down the one trade-off you made and why.`,
      `Paste a short summary below and self-evaluate against the rubric anchors.`,
    ],
    expectedOutput: `A short written artefact (half a page or less) that shows: ${lower(deliverable(m))}, with one named trade-off.`,
    hints: [
      `Start from the objective: ${lower(m.objective)}.`,
      `Check your work against the common mistake: ${lower(m.commonMistakes[0] ?? 'skipping the basics')}.`,
      `Finish with a number: a metric, a budget or a time box.`,
    ],
    rubric: [
      {
        criterion: 'Completeness',
        anchors: [
          { level: 1, label: 'Weak', description: 'Deliverable missing key parts' },
          { level: 2, label: 'Developing', description: 'Most parts present, some vague' },
          { level: 3, label: 'Solid', description: 'All parts present and specific' },
          { level: 4, label: 'Strong', description: 'Specific, with numbers and edge cases' },
        ],
      },
      {
        criterion: 'Trade-offs',
        anchors: [
          { level: 1, label: 'Weak', description: 'No trade-off stated' },
          { level: 2, label: 'Developing', description: 'Named but not weighed' },
          { level: 3, label: 'Solid', description: 'Weighed for this context' },
          { level: 4, label: 'Strong', description: 'Tied to the success metric' },
        ],
      },
    ],
  }
}

/** Picks n distinct items from a pool, skipping `exclude`, deterministically by seed. */
function pick<T>(pool: T[], exclude: T, n: number, seed: number): T[] {
  const out: T[] = []
  for (let i = 0; out.length < n && i < pool.length * 2; i++) {
    const c = pool[(seed + i * 7) % pool.length]
    if (c !== exclude && !out.includes(c)) out.push(c)
  }
  return out
}

function item(
  m: Module,
  n: number,
  kind: AssessmentItem['kind'],
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  remediation: string,
  scenario?: string,
): AssessmentItem {
  // Rotate the correct answer through positions a–d so it is not always first.
  const slot = n % 4
  const texts = [...distractors.slice(0, 3)]
  texts.splice(slot, 0, correct)
  const ids = ['a', 'b', 'c', 'd']
  return {
    id: `${m.id}-cp-q${n}`,
    kind,
    prompt,
    scenario,
    options: texts.map((text, i) => ({ id: ids[i], text })),
    correctOptionId: ids[slot],
    explanation,
    skillId: m.skillIds[n % m.skillIds.length],
    remediationModuleId: remediation,
  }
}

export function generatedCheckpointItems(m: Module): AssessmentItem[] {
  const idx = MODULES.indexOf(m)
  const others = MODULES.filter((x) => x.id !== m.id)
  const objectives = others.map((x) => x.objective)
  const scopes = others.map((x) => x.scope)
  const mistakes = others.flatMap((x) => x.commonMistakes)
  const deliverables = others.map(deliverable)
  const titles = others.map((x) => `${x.code} ${x.title}`)
  const before = m.prerequisites[0] ? MODULES.find((x) => x.id === m.prerequisites[0]) : undefined
  const after = m.unlocks[0] ? MODULES.find((x) => x.id === m.unlocks[0]) : undefined
  const self = `${m.code} ${m.title}`
  const prereqTitles = m.prerequisites.map((p) => {
    const x = MODULES.find((y) => y.id === p)
    return x ? `${x.code} ${x.title}` : ''
  })
  const nonPrereq = titles.filter((t) => !prereqTitles.includes(t))

  return [
    item(m, 1, 'multiple-choice', `Which outcome is ${m.code} designed to produce?`, m.objective, pick(objectives, m.objective, 3, idx), `${m.code}’s objective is to ${lower(m.objective)}.`, m.id),
    item(m, 2, 'multiple-choice', `Which mistake does ${m.code} specifically warn against?`, m.commonMistakes[0], pick(mistakes, m.commonMistakes[0], 3, idx + 3), `The module names “${m.commonMistakes[0]}” as its most common failure.`, m.id),
    item(m, 3, 'multiple-choice', `What is inside the scope boundary of ${m.code}?`, m.scope, pick(scopes, m.scope, 3, idx + 5), `Scope: ${m.scope}.`, m.id),
    before
      ? item(m, 4, 'multiple-choice', `Which module is a prerequisite for ${m.code}?`, `${before.code} ${before.title}`, pick(nonPrereq, '', 3, idx + 11), `${before.code} comes first: ${m.code} builds on it.`, before.id)
      : item(m, 4, 'multiple-choice', `Which module builds directly on ${m.code}?`, after ? `${after.code} ${after.title}` : self, pick(titles, after ? `${after.code} ${after.title}` : self, 3, idx + 13), after ? `${after.code} lists ${m.code} as a prerequisite.` : `${m.code} stands on its own.`, after?.id ?? m.id),
    item(m, 5, 'scenario', 'Which module would best prepare you for this question?', self, pick(titles, self, 3, idx + 17), `This is the interview probe ${m.code} prepares you for.`, m.id, `An interviewer asks: “${probe(m)}”`),
    item(m, 6, 'scenario', 'Which deliverable would best prove you can do this?', deliverable(m), pick(deliverables, deliverable(m), 3, idx + 19), `${m.code}’s hands-on deliverable is: ${lower(deliverable(m))}.`, m.id, `You need to show evidence that you can ${lower(m.objective)}.`),
  ]
}

export function checkpointFor(m: Module, itemIds: string[]): Assessment {
  return {
    id: m.checkpointId,
    kind: 'checkpoint',
    title: `${m.code} checkpoint`,
    moduleId: m.id,
    passPercent: 70,
    itemIds,
  }
}

