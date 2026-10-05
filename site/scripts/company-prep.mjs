/**
 * Syncs company-specific preparation packs into the deployable `site/content/`
 * snapshot. The source folder may be intentionally gitignored, so the generated
 * content is committed and can be built when the Vercel project is rooted at `site/`.
 */

import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { TRACKS } from '../src/lib/editorial.ts'

export const COMPANY_PREP_MODULE_ID = '16-company-oriented-prep'
export const COMPANY_PREP_TRACK_ID = 'blitzy-prep'
const TRACK_ID = COMPANY_PREP_TRACK_ID

/** Source file -> page, in display order. Exported so the Learn sync can link to these pages. */
export const COMPANY_PREP_DOCUMENTS = [
  { file: 'README.md', slug: 'start-here', order: 1, title: 'Start Here' },
  { file: '00_Coverage_And_Gaps.md', slug: 'coverage-and-gaps', order: 2 },
  { file: '01_Code_Review_Bug_Drills.md', slug: 'code-review-bug-drills', order: 3 },
  { file: '02_Blitzy_Product_And_Demo_Brief.md', slug: 'product-and-demo-brief', order: 4 },
  { file: '03_Questions_To_Ask_Interviewer.md', slug: 'questions-to-ask', order: 5 },
  { file: '04_Incident_Triage_And_Customer_Comms.md', slug: 'incident-triage-and-customer-comms', order: 6 },
  { file: '05_CTO_Trust_And_Vision_To_Roadmap.md', slug: 'cto-trust-and-roadmap', order: 7 },
  { file: '06_Brownfield_Integration_And_Testing.md', slug: 'brownfield-integration-and-testing', order: 8 },
  { file: '07_Enterprise_SDLC_Agile_CrossFunctional.md', slug: 'enterprise-sdlc-and-cross-functional', order: 9 },
  { file: '08_Scaling_Spikes_And_Graceful_Degradation.md', slug: 'scaling-spikes-and-graceful-degradation', order: 10 },
  { file: 'Final_Round/00_Final_Round_Runbook.md', slug: 'final-round-runbook', order: 11, title: 'Final Round Runbook' },
  { file: 'Final_Round/01_Engineering_Fit_And_Technical_Aptitude.md', slug: 'final-round-engineering-fit', order: 12, title: 'Engineering Fit and Technical Aptitude' },
  { file: 'Final_Round/02_Ownership_Story_Workbook.md', slug: 'final-round-ownership', order: 13, title: 'Ownership Story Workbook' },
  { file: 'Final_Round/03_Executive_Communication_And_Scope.md', slug: 'final-round-executive-communication', order: 14, title: 'Executive Communication and Scope' },
  { file: 'Final_Round/04_Final_Round_Mock_Interview.md', slug: 'final-round-mock-interview', order: 15, title: 'Final Round Mock Interview' },
]

function titleFrom(markdown, fallback) {
  const heading = markdown.split('\n').find((line) => line.startsWith('# '))
  return heading ? heading.replace(/^#\s+/, '').trim() : fallback
}

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

export async function syncCompanyPrep({ repoRoot, outDir, snapshotDir }) {
  const sourceDir = join(repoRoot, '08_Company_Specific_Prep', 'Blitzy')
  const track = TRACKS[TRACK_ID]
  if (!track) throw new Error(`Track "${TRACK_ID}" has no editorial entry`)

  if (!(await isDirectory(sourceDir))) {
    if (!(snapshotDir && (await isDirectory(snapshotDir)))) {
      throw new Error(
        `Blitzy source is not available at ${sourceDir} and no committed site snapshot was found.`,
      )
    }

    await cp(snapshotDir, join(outDir, 'modules', COMPANY_PREP_MODULE_ID), {
      recursive: true,
    })
    const scenarios = []
    for (const document of COMPANY_PREP_DOCUMENTS) {
      const raw = await readFile(
        join(snapshotDir, TRACK_ID, document.slug, 'company-guide.md'),
        'utf8',
      )
      scenarios.push({
        slug: document.slug,
        order: document.order,
        title: document.title ?? titleFrom(raw, document.slug),
        tag: `Blitzy ${String(document.order).padStart(2, '0')}`,
        tabs: [{ id: 'company-guide', label: 'Company Guide' }],
      })
    }
    scenarios.push({
      slug: 'drill-verifier',
      order: 16,
      title: 'Drill Verifier',
      tag: 'Blitzy 16',
      tabs: [{ id: 'company-guide', label: 'Company Guide' }],
    })
    return {
      id: COMPANY_PREP_MODULE_ID,
      kind: 'reading',
      tracks: [{ id: TRACK_ID, title: track.title, blurb: track.blurb, scenarios }],
    }
  }

  const scenarios = []
  for (const document of COMPANY_PREP_DOCUMENTS) {
    const raw = await readFile(join(sourceDir, document.file), 'utf8')
    const outDirForDocument = join(outDir, 'modules', COMPANY_PREP_MODULE_ID, TRACK_ID, document.slug)
    await mkdir(outDirForDocument, { recursive: true })
    await writeFile(join(outDirForDocument, 'company-guide.md'), raw)
    scenarios.push({
      slug: document.slug,
      order: document.order,
      title: document.title ?? titleFrom(raw, document.slug),
      tag: `Blitzy ${String(document.order).padStart(2, '0')}`,
      tabs: [{ id: 'company-guide', label: 'Company Guide' }],
    })
  }

  const drillSource = await readFile(join(sourceDir, 'drills_verify.py'), 'utf8')
  const drillMarkdown = `# Drill Verifier\n\nRun this script locally to check the Blitzy bug-drill exercises.\n\n## Run it locally\n\n\`\`\`bash\npython drills_verify.py\n\`\`\`\n\n## Script\n\n\`\`\`python\n${drillSource.trim()}\n\`\`\`\n`
  const drillOutDir = join(outDir, 'modules', COMPANY_PREP_MODULE_ID, TRACK_ID, 'drill-verifier')
  await mkdir(drillOutDir, { recursive: true })
  await writeFile(join(drillOutDir, 'company-guide.md'), drillMarkdown)
  scenarios.push({
    slug: 'drill-verifier',
    order: 16,
    title: 'Drill Verifier',
    tag: 'Blitzy 16',
    tabs: [{ id: 'company-guide', label: 'Company Guide' }],
  })

  return {
    id: COMPANY_PREP_MODULE_ID,
    kind: 'reading',
    tracks: [{ id: TRACK_ID, title: track.title, blurb: track.blurb, scenarios }],
  }
}
