/** Builds the prototype's search index from the demo data. Server-only by usage. */
import * as repo from './repo'
import type { DemoSearchEntry } from './search'

export function buildSearchIndex(): DemoSearchEntry[] {
  const out: DemoSearchEntry[] = []
  for (const t of repo.listTracks()) {
    out.push({ kind: 'Track', title: `${t.code} ${t.title}`, subtitle: t.objective, href: repo.href.track(t.id), text: t.exitCompetencies.join(' ') })
  }
  for (const m of repo.listModules()) {
    out.push({ kind: 'Module', title: `${m.code} ${m.title}`, subtitle: m.objective, href: repo.href.module(m), text: `${m.scope} ${m.commonMistakes.join(' ')}` })
  }
  for (const l of repo.listLessons()) {
    const m = repo.getModule(l.moduleId)!
    out.push({ kind: 'Lesson', title: l.title, subtitle: `${m.code} · ${l.tagline}`, href: repo.href.lesson(l), text: l.sections.map((s) => `${s.heading} ${s.body}`).join(' ') })
  }
  for (const p of repo.listProjects()) {
    out.push({ kind: 'Project', title: `${p.code} ${p.title}`, subtitle: p.businessProblem, href: repo.href.project(p.id), text: `${p.typeLabel} ${p.suggestedArchitecture}` })
  }
  for (const q of repo.listQuestions()) {
    out.push({ kind: 'Question', title: q.prompt, subtitle: `${repo.getHub(q.hubId)?.title} · ${q.topic}`, href: repo.href.question(q), text: q.conceptReview })
  }
  for (const c of repo.listCases()) {
    out.push({ kind: 'Case', title: `${c.code} ${c.title}`, subtitle: c.summary, href: repo.href.case(c.id), text: c.pattern })
  }
  for (const g of repo.listGlossary()) {
    out.push({ kind: 'Glossary', title: g.term, subtitle: g.expansion ?? g.definition, href: `/demo/glossary#${g.id}`, text: g.definition })
  }
  return out
}
