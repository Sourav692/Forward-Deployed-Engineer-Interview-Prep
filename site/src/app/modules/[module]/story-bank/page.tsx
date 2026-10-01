import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStoryBank, getTracks } from '@/lib/content'
import { STORY_BANK, STORY_BANK_META } from '@/lib/editorial'
import { getModule } from '@/lib/registry'
import type { ReadingDocument, ReadingSection } from '@/lib/reading'
import { BeforeYouStart, MetaStrip } from '@/components/PageIntro'
import { ReadingPanel } from '@/components/CaseStudyView'

/**
 * The behavioural Story Bank (CONTENT-15): markdown from
 * `FDE/Behavioral_and_Leadership/story_bank.md`, synced to
 * `content/behavioural/` and rendered with the same reading panel as the case studies.
 * It lives under the behavioural module, beside its two tracks; the static `story-bank`
 * segment takes precedence over the `[track]` route.
 */

type Params = { module: string }

export const dynamicParams = false

export function generateStaticParams() {
  return [{ module: STORY_BANK.moduleId }]
}

export const metadata: Metadata = { title: STORY_BANK.title, description: STORY_BANK.blurb }

export default async function StoryBankPage({ params }: { params: Promise<Params> }) {
  const { module: moduleId } = await params
  const mod = getModule(moduleId)
  const bank = await getStoryBank()
  if (moduleId !== STORY_BANK.moduleId || !mod || !bank) notFound()
  const tracks = await getTracks(moduleId)

  return (
    <div className="py-10">
      <nav aria-label="Breadcrumb" className="no-print mb-6 flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-subtle">
        <Link href={`/modules/${moduleId}`} className="transition-colors hover:text-text">
          {mod.title}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-muted">{STORY_BANK.title}</span>
      </nav>

      <header className="mb-10 max-w-3xl">
        <h1 className="text-[2rem] font-bold leading-[1.2] tracking-[-0.02em]">{STORY_BANK.title}</h1>
        <p className="mt-3 text-[1rem] leading-relaxed text-muted">{STORY_BANK.blurb}</p>
        <div className="mt-3">
          <MetaStrip meta={STORY_BANK_META} minutes={bank.minutes} />
        </div>
        <BeforeYouStart meta={STORY_BANK_META} />
      </header>

      <section className="no-print mb-12" aria-labelledby="customer-stories-title">
        <div className="mb-5 max-w-3xl">
          <h2 id="customer-stories-title" className="text-[1.375rem] font-semibold tracking-[-0.014em]">
            Choose a customer story
          </h2>
          <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">
            Start with the engagement that best fits the question, then use its detailed stories
            below to prepare a specific two-minute answer.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {STORY_GROUPS.map((group) => (
            <a key={group.id} href={`#${group.id}`} className="story-bank-card group">
              <span className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-subtle">
                Customer engagement
              </span>
              <h3 className="mt-1.5 text-[1.125rem] font-semibold transition-colors group-hover:text-accent">
                {group.shortTitle}
              </h3>
              <p className="mt-1.5 flex-1 text-[0.875rem] leading-relaxed text-muted">{group.context}</p>
              <div className="mt-4 border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
                <span className="font-semibold text-text">Best for: </span>{group.bestFor}
              </div>
              <span className="mt-3 text-[0.875rem] font-semibold text-accent transition-colors group-hover:text-accent-hover">
                View customer stories →
              </span>
            </a>
          ))}
        </div>
      </section>

      <ReadingPanel doc={structureStoryBank(bank.doc)} drawDiagrams />

      <section className="no-print mt-14 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-[1.0625rem] font-semibold">Where next</h2>
        <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">
          Take a worksheet question, pick a story from its &ldquo;Stories that fit&rdquo; line and say it
          out loud in two minutes.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.875rem] font-semibold">
          {tracks.map((track) => (
            <Link
              key={track.id}
              href={`/modules/${moduleId}#${track.id}`}
              className="text-accent hover:text-accent-hover"
            >
              {track.title} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

type StoryGroup = {
  id: string
  title: string
  shortTitle: string
  context: string
  bestFor: string
  matches: (title: string) => boolean
}

const STORY_GROUPS: StoryGroup[] = [
  {
    id: 'asian-life-insurer',
    title: 'Asian life insurer',
    shortTitle: 'Asian life insurer',
    context: 'A short project to help insurance teams ask questions about sensitive company data safely.',
    bestFor: 'Understanding a customer, keeping the first launch small, handling a problem, and earning trust.',
    matches: (title) => title.startsWith('The insurer:'),
  },
  {
    id: 'consumer-lender',
    title: 'Indian consumer lender',
    shortTitle: 'Indian consumer lender',
    context: 'A project to help an IT team investigate lead-routing issues without making risky automatic changes.',
    bestFor: 'Learning a new customer system, making safe choices, and being honest about results.',
    matches: (title) => title.startsWith('The lender:'),
  },
  {
    id: 'meridian-assist',
    title: 'Meridian Assist reference build',
    shortTitle: 'Meridian Assist reference build',
    context: 'A small reference system used to prove that answers are safe, checked, and backed by evidence.',
    bestFor: 'High standards, testing, owning mistakes, and explaining safety to non-technical people.',
    matches: (title) => title.startsWith('Meridian:'),
  },
  {
    id: 'cross-engagement',
    title: 'Guardrails and reusable patterns',
    shortTitle: 'Guardrails and reusable patterns',
    context: 'Stories about saying no safely, writing down known gaps, and sharing useful lessons with other teams.',
    bestFor: 'Making a difficult call, keeping people safe, and having impact beyond one customer.',
    matches: (title) =>
      title.startsWith('The guardrail engine:') ||
      title.startsWith('Financial services:') ||
      title.startsWith('Beyond one engagement:'),
  },
]

function structureStoryBank(doc: ReadingDocument): ReadingDocument {
  const leadIn = doc.sections.find((section) => section.title === null)
  const stories = doc.sections.filter((section) => section.title !== null)
  const used = new Set<ReadingSection>()
  const groups = STORY_GROUPS.map((group) => {
    const members = stories.filter((section) => section.title && group.matches(stripHtml(section.title)))
    members.forEach((member) => used.add(member))
    return toGroupSection(group, members)
  })
  const resources = stories.filter((section) => !used.has(section))
  const resourceSection = resources.length
    ? {
        id: 'story-bank-build-your-own',
        title: 'Build and complete your own story bank',
        chunks: [{
          kind: 'html' as const,
        html: resources.map(renderStory).join(''),
        }],
      }
    : null

  return {
    ...doc,
    sections: [leadIn, ...groups, resourceSection].filter(
      (section): section is ReadingSection => Boolean(section),
    ),
  }
}

function toGroupSection(group: StoryGroup, stories: ReadingSection[]): ReadingSection {
  return {
    id: group.id,
    title: group.title,
    chunks: [{
      kind: 'html',
      html:
        `<div class="story-group-intro"><p><strong>Customer context:</strong> ${group.context}</p>` +
        `<p><strong>Best interview use:</strong> ${group.bestFor}</p></div>` +
        stories.map(renderStory).join(''),
    }],
  }
}

function renderStory(story: ReadingSection): string {
  const title = stripHtml(story.title ?? '')
  return `<article class="story-card"><h3>${story.title}</h3>${story.chunks.map((chunk) => renderChunk(chunk, title)).join('')}</article>`
}

function renderChunk(chunk: ReadingSection['chunks'][number], title: string): string {
  if (chunk.kind !== 'html') return ''
  const spokenAnswer = INTERVIEW_ANSWERS[title]
  if (spokenAnswer && chunk.html.includes('<strong>Say it in one line:</strong>')) {
    return `<div class="interview-answer"><strong>Say this in the interview</strong><p>“${spokenAnswer}”</p></div>`
  }
  return chunk.html
    .replace('<strong>Engagement:</strong>', '<strong>Customer:</strong>')
    .replace('<strong>Grounding:</strong>', '<strong>What you need to make your own:</strong>')
    .replace('<strong>Situation:</strong>', '<strong>What the customer needed:</strong>')
    .replace('<strong>Task:</strong>', '<strong>My job as the FDE:</strong>')
    .replace('<strong>Action:</strong>', '<strong>What I did:</strong>')
    .replace('<strong>Result:</strong>', '<strong>What happened:</strong>')
    .replace('<strong>What it proves:</strong>', '<strong>What this shows the interviewer:</strong>')
    .replace('<strong>Answers:</strong>', '<strong>Good interview questions for this story:</strong>')
}

const INTERVIEW_ANSWERS: Record<string, string> = {
  'The insurer: two conversations in discovery': 'The customer asked for an AI assistant, but I first spoke to both users and compliance. I learned that safe access to data was the real problem, so I designed around that before building anything.',
  'The insurer: starting narrow when the sponsor wanted wide': 'The sponsor wanted to launch everywhere at once. I explained the risk in their terms and helped them start with a smaller, safer first release that proved the value.',
  'The insurer: one agent to a supervisor': 'My first design failed in testing. I told the sponsor straight away, explained what was wrong, changed the design, and still delivered on time.',
  'The insurer: seeing the next ceiling coming': 'The first solution worked, but I could see where it would fail as the work grew. I delivered the short-term answer, then improved the design before it became a customer problem.',
  'The insurer: hand-building the supervisor': 'A platform feature we needed was not ready for the customer. I used managed tools where they fit and built the missing part myself, so the customer was not waiting on someone else’s roadmap.',
  'The insurer: building the data foundation nobody owned': 'The customer needed trustworthy answers, but the data layer was not ready. I worked with their data team and built the right foundation so every answer could be traced back to approved data.',
  'The insurer: two checkpoints, in plain words': 'The system could have used old permission data. I added one fast check and one final live check, then explained the design in simple terms so compliance could approve it confidently.',
  'The lender: a couple of hundred tickets, three problems': 'Before building anything, I read real customer tickets. I found three different problems, not one, and built a solution that matched what the customer was actually seeing.',
  'The lender: no unreviewed writes to production': 'The fast demo would have let the AI change production settings on its own. I recommended a safer design where an engineer reviews every change, even though it was less flashy.',
  'The lender: the metric I couldn\'t prove': 'The system worked, but I had not measured the starting point properly. I did not make up an impact number, and I changed my process so success measures are agreed before the work starts.',
  'Meridian: the zero-leak gate': 'For this customer, one data leak was one too many. I made that a hard release rule and used tests to prove it, instead of trusting the AI to make a security decision.',
  'Meridian: the false-alarm leak': 'A security test looked like it found a leak. I treated it seriously, found that my test data was wrong, documented my own mistake, and added a check to stop it happening again.',
  'Meridian: 22 out of 22 on 22 documents': 'The results looked perfect, but the test set was small. I chose the simpler option, and I was clear about what the numbers proved and what they did not prove.',
  'The guardrail engine: shipping the gap in writing': 'I shipped a useful first version with a known limit. I wrote that limit down clearly, explained the production fix, and proved exactly what the current version could do.',
  'Financial services: red-teaming before saying no': 'The customer wanted fully automated decisions. I tested the risky cases, showed them the evidence, and offered a safer option that kept the useful automation.',
  'Beyond one engagement: patterns that travel': 'I noticed I was solving the same problem for different customers. I turned the useful parts into reusable tools and taught other people the pattern so they could use it too.',
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, '')
}
