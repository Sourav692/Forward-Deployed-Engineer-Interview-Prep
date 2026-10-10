import 'server-only'

import { familyMeta, getAllScenarios, getScenario } from './content'
import { MODULES } from './curriculum'
import { moduleInput } from './learn'
import { scenarioHref } from './scenario'
import type { ModuleInput } from '@/components/learn/progress-model'

/**
 * Build-time inputs for the progress pages (FE-16). The dashboard runs in the browser,
 * but what it measures against comes from the synced content: each module's reading
 * list and minutes, and how many questions each competency worksheet holds.
 */

/** One competency worksheet; its answer statuses live at `fd:v1:answer-statuses:<key>`. */
export type CompetencySheet = { key: string; title: string; href: string; questions: number }

export type DashboardData = { modules: ModuleInput[]; sheets: CompetencySheet[] }

export async function dashboardData(): Promise<DashboardData> {
  const modules = MODULES.filter((m) => m.status !== 'coming-soon' && m.status !== 'on-hold').map(moduleInput)
  const refs = (await getAllScenarios()).filter((r) => !r.reading && familyMeta(r.trackId).mode === 'behavioural')
  const sheets = await Promise.all(
    refs.map(async (r) => {
      const scenario = await getScenario(r.moduleId, r.trackId, r.slug)
      return { key: `${r.trackId}/${r.slug}`, title: r.title, href: scenarioHref(r), questions: scenario?.sections.length ?? 0 }
    }),
  )
  return { modules, sheets }
}
