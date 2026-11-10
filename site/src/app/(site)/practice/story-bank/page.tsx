import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllScenarios, getStoryBank, getTracks } from '@/lib/content'
import { PrevNext } from '@/components/PrevNext'
import { qualifiedTitle, scenarioHref } from '@/lib/scenario'
import { LEVEL_LABEL, MODES, STORY_BANK, STORY_BANK_META, STORY_GROUPS, storyGroupOf } from '@/lib/editorial'
import { Breadcrumbs } from '@/components/learn/Breadcrumbs'
import type { ReadingDocument, ReadingSection } from '@/lib/reading'
import { BeforeYouStart } from '@/components/PageIntro'
import { PageHead } from '@/components/editorial/PageHead'
import { ReadingPanel } from '@/components/CaseStudyView'
import { LessonTabs } from '@/components/learn/LessonTabs'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { SHOW_STUDY_TIME } from '@/lib/study-time'

/**
 * The behavioural Story Bank (CONTENT-15): markdown from
 * `04_Behavioral_and_Leadership/story_bank.md`, synced to
 * `content/behavioural/` and rendered with the same reading panel as the case studies.
 * It lives at /practice/story-bank beside the worksheets it answers (ENH-17); the static
 * `story-bank` segment takes precedence over the `[worksheetSlug]` route.
 */

export const metadata: Metadata = pageMetadata({ path: STORY_BANK.href, title: STORY_BANK.title, description: STORY_BANK.blurb })

export default async function StoryBankPage() {
  const bank = await getStoryBank()
  if (!bank) notFound()
  const tracks = await getTracks(STORY_BANK.moduleId)
  // The Story Bank comes before the behavioural worksheets it answers (ENH-22, PQ-05).
  const first = (await getAllScenarios()).find((s) => s.moduleId === STORY_BANK.moduleId)
  const doc = structureStoryBank(bank.doc)
  const leadIn = doc.sections.find((s) => s.title === null)
  const groups = doc.sections.filter((s) => s.title !== null)

  return (
    <div className="pb-20 pt-8">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Practice', path: '/practice' }, { name: STORY_BANK.title, path: '/practice/story-bank' }])} />
      <Breadcrumbs items={[{ label: 'Practice', href: '/practice' }, { label: STORY_BANK.title }]} />

      <PageHead
        title={STORY_BANK.title}
        standfirst={STORY_BANK.blurb}
        facts={[
          { term: 'Kind', value: MODES[STORY_BANK_META.mode].label },
          // The worksheets' level vocabulary (Foundation, Core, Advanced), not the meta's "Intermediate".
          { term: 'Level', value: LEVEL_LABEL.core },
          ...(SHOW_STUDY_TIME ? [{ term: 'Reading time', value: `${bank.minutes} min` }] : []),
        ]}
        updated={bank.updated}
        report={{ title: STORY_BANK.title, path: STORY_BANK.href }}
      >
        <BeforeYouStart meta={STORY_BANK_META} />
      </PageHead>

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
              <h3 className="text-[1.125rem] font-semibold transition-colors group-hover:text-accent">
                {group.title}
              </h3>
              <p className="mt-1.5 flex-1 text-[0.875rem] leading-relaxed text-muted">{group.context}</p>
              <div className="mt-4 border-t border-border pt-3 text-[0.8125rem] leading-relaxed text-muted">
                <span className="font-semibold text-text">Best for: </span>{group.bestFor}
              </div>
              <span className="mt-3 text-[0.875rem] font-semibold text-accent transition-colors group-hover:text-accent-hover">
                View customer stories
              </span>
            </a>
          ))}
        </div>
      </section>

      <ReadingPanel doc={{ ...doc, sections: leadIn ? [leadIn] : [] }} drawDiagrams />
      {/* One tab per customer group, so no view runs past the page-length limit (ENH-25). */}
      <LessonTabs
        label="Customer stories"
        tabs={groups.map((section) => ({
          id: section.id,
          label: STORY_GROUPS.find((g) => g.id === section.id)?.title ?? 'Build your own',
          panel: <ReadingPanel doc={{ ...doc, title: '', sections: [section] }} drawDiagrams />,
        }))}
      />

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
              href={`/practice#${track.id}`}
              className="text-accent hover:text-accent-hover"
            >
              {track.title}
            </Link>
          ))}
        </div>
      </section>

      <PrevNext next={first && { href: scenarioHref(first), title: qualifiedTitle(first) }} />
    </div>
  )
}

function structureStoryBank(doc: ReadingDocument): ReadingDocument {
  const leadIn = doc.sections.find((section) => section.title === null)
  const stories = doc.sections.filter((section) => section.title !== null)
  const used = new Set<ReadingSection>()
  const groups = STORY_GROUPS.map((group) => {
    const members = stories.filter((section) => section.title && storyGroupOf(stripHtml(section.title))?.id === group.id)
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

function toGroupSection(group: (typeof STORY_GROUPS)[number], stories: ReadingSection[]): ReadingSection {
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
