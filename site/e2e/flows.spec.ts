import { expect, test, type Page } from '@playwright/test'
import { CHECKPOINTS } from '../src/lib/checkpoints'
import { SHOW_STUDY_TIME } from '../src/lib/study-time'
import {
  CASE_STUDY,
  CHECKPOINT_MODULE,
  GATED_MODULE,
  LESSON,
  LESSON_TITLE,
  MOCK_LESSON,
  READY_MODULE,
  WORKSHEET,
  fdStorage,
  hydrated,
  tabTo,
} from './helpers'

// Smoke flows from plan §13 (QA-02). Each test starts with empty storage (a fresh
// browser context), so they run in parallel without sharing progress.

test('path flow: landing → start → keyboard diagnostic → path flag on /learn', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('main').getByRole('link', { name: 'Choose your path', exact: true }).first().click()
  await expect(page).toHaveURL(/\/start$/)
  await hydrated(page)

  const begin = page.getByRole('button', { name: 'Start the diagnostic' })
  await tabTo(page, begin)
  await page.keyboard.press('Enter')

  // Ten questions, answered by keyboard only: Tab into the radio group, Space picks
  // the first option, Tab to Next / See my path, Enter.
  for (let q = 1; q <= 10; q++) {
    await expect(page.getByText(`Question ${q} of 10`, { exact: true })).toBeVisible()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Space')
    await expect(page.getByRole('radio').first()).toBeChecked()
    const next = page.getByRole('button', { name: q === 10 ? 'See my path' : 'Next' })
    await tabTo(page, next)
    await page.keyboard.press('Enter')
  }

  await expect(page.getByText('Your Recommended Path')).toBeVisible()
  // ON: the result is a week-by-week plan, not just a path name. The plan is built from
  // study-time estimates, so it shows only while SHOW_STUDY_TIME is on.
  if (SHOW_STUDY_TIME) {
    await expect(page.getByRole('heading', { name: 'Your Weekly Plan' })).toBeVisible()
    await expect(page.getByText(/^Weeks? 1(–\d+)?$/)).toBeVisible()
  } else {
    await expect(page.getByRole('heading', { name: 'Your Weekly Plan' })).toHaveCount(0)
  }
  const follow = page.getByRole('button', { name: /^Start first module|^Choose this path/ })
  await tabTo(page, follow)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/learn\//)

  const stored = await fdStorage(page)
  expect(stored['fd:v1:path']).toBeTruthy()

  await page.goto('/learn')
  await expect(page.getByText('You are following the')).toBeVisible()
  // Track cards, with their path summary, sit on the topic group pages.
  await page.goto('/learn/topics/ai-engineering')
  await expect(page.getByText('Your path:').first()).toBeVisible()
})

test('learn flow: module → lesson → mark read persists → module progress', async ({ page }) => {
  await page.goto(READY_MODULE)
  await hydrated(page)
  await page.getByRole('region', { name: 'Lessons' }).getByRole('link', { name: LESSON_TITLE, exact: true }).click()
  await expect(page).toHaveURL(LESSON)
  await hydrated(page)

  await page.getByRole('button', { name: 'Mark read' }).click()
  await expect(page.getByRole('button', { name: 'Mark unread' })).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await expect(page.getByRole('button', { name: 'Mark unread' })).toBeVisible()

  await page.goto(READY_MODULE)
  await expect(page.getByText(/^1 of \d+ read$/).first()).toBeVisible()
})

// CT-01: G01 opens on its Introduction, with a sidebar of documents and their parts. Part
// ids stay in the hash and in saved progress, so old links and read state still work.
async function caseContents(page: Page) {
  const toggle = page.getByRole('button', { name: /^Contents/ })
  if (await toggle.isVisible()) await toggle.click()
  return page.getByRole('navigation', { name: 'Case contents' })
}

test('case chapters: G01 introduction, sidebar parts, old links and progress', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('fd:v1:read:knowledge-retrieval/enterprise-knowledge-assistant', JSON.stringify(['main', 'main-part-2']))
  })
  await page.goto(CASE_STUDY)
  await hydrated(page)
  await expect(page.getByRole('region', { name: 'Introduction' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Optional' })).toBeVisible()
  await expect(page.getByText(/databricks/i)).toHaveCount(0)
  await expect(page.getByText(/\bG01\b/)).toHaveCount(0)
  // Full Design is optional, so its parts stay folded until it is open.
  await expect(page.locator('#case-contents').getByRole('button', { name: 'Full Design, part 1', includeHidden: true })).toHaveCount(0)

  await page.goto(`${CASE_STUDY}#full-pack-part-3`)
  await hydrated(page)
  await expect(page.getByRole('region', { name: 'Full Design' })).toBeVisible()
  // Checked without opening the phone menu, which would cover the buttons below.
  await expect(page.locator('#case-contents').getByRole('button', { name: 'Full Design, part 3', includeHidden: true })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('button', { name: 'Next: Part 4 →' }).click()
  await expect(page).toHaveURL(/#full-pack-part-4$/)

  const nav = await caseContents(page)
  await expect(nav.getByRole('button', { name: 'Full Design, part 4' })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByText(/^1 of 4 read$/)).toBeVisible()
  await nav.getByRole('button', { name: /^Interview Guide( \d+ min)?$/ }).click()
  await expect(page).toHaveURL(/#main$/)
  await expect(page.getByRole('button', { name: 'Interview Guide part 1 marked as read' })).toBeVisible()

  // Arrow keys move between parts.
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#main-part-2$/)
  await page.keyboard.press('ArrowLeft')
  await expect(page).toHaveURL(/#main$/)

  // Scrolling to the end of a part marks it read, and says so.
  await page.goto(`${CASE_STUDY}#deep-dive`)
  await hydrated(page)
  await expect(page.getByRole('region', { name: 'Technical Deep Dive' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.getByRole('button', { name: 'Technical Deep Dive marked as read' })).toBeVisible()
  await expect(page.getByText('Marked when you reached the end. Select the button to undo.')).toBeVisible()

  // A later visit without a hash offers to resume the last part open.
  await page.goto(CASE_STUDY)
  await hydrated(page)
  await expect(page.getByText('You were reading Technical Deep Dive.')).toBeVisible()
  await page.getByRole('button', { name: 'Continue →' }).click()
  await expect(page).toHaveURL(/#deep-dive$/)
})

// Every scenario-pack case with an Introduction page gets the same layout as G01.
test('case chapters: another case opens on its introduction with the sidebar', async ({ page }) => {
  await page.goto('/design/customer-support-automation')
  await hydrated(page)
  await expect(page.getByRole('region', { name: 'Introduction' })).toBeVisible()
  const nav = await caseContents(page)
  await expect(nav.getByRole('button', { name: 'Interview Guide, part 2' })).toBeAttached()
  await expect(page.getByText(/\bG\d{2}\b/)).toHaveCount(0)
})

// ENH-30: a client simulation is scored on its own round, with no round picker, and keeps its
// hidden constraints behind disclosures until the learner opens one.
test('client simulation: score the client-sim round → attempt saved under its own key', async ({ page }) => {
  await page.goto('/interview/mock-interviews/bank-policy-assistant-client-simulation')
  await hydrated(page)
  await expect(page.getByRole('timer')).toHaveText('45:00')
  await expect(page.getByText('Which round did you run?')).toHaveCount(0)
  await expect(page.locator('details').first()).not.toHaveAttribute('open', /.*/)

  const dims = ['Discovery questions', 'Handling constraints', 'Framing back to the customer', 'Scoping', 'Next steps', 'Communication']
  for (const dim of dims) await page.getByRole('group', { name: dim, exact: true }).getByText('3', { exact: true }).click()
  await page.getByRole('button', { name: 'Save client simulation score' }).click()
  const result = page.getByText(/^Last saved, client simulation: Pass, mean 3/)
  await expect(result).toBeVisible()
  expect(Object.keys(await fdStorage(page))).toContain('fd:v1:learn:attempts:mock:bank-policy-assistant-client-simulation:client-sim')

  await page.reload()
  await hydrated(page)
  await expect(result).toBeVisible()
})

test('mock flow: score a full round → pass rule applied → result survives reload', async ({ page }) => {
  await page.goto(MOCK_LESSON)
  await hydrated(page)
  await expect(page.getByRole('timer')).toHaveText('45:00')

  // The radios are visually hidden inside their labels, so click the label as a user would.
  const full = page.getByText('Full round (6 dimensions)', { exact: true })
  await full.click()
  const scores = { Discovery: '4', Architecture: '3', Security: '1', Evaluation: '4', Production: '5', Communication: '4' }
  for (const [dim, value] of Object.entries(scores)) {
    await page.getByRole('group', { name: dim, exact: true }).getByText(value, { exact: true }).click()
  }
  // Scores of 4 or 5 need a line of evidence before the round saves.
  await page.getByRole('button', { name: 'Save full round score' }).click()
  await expect(page.getByText(/^Add a line of evidence for each score of 4 or 5: Discovery, Evaluation, Production, Communication\.$/)).toBeVisible()
  for (const dim of ['Discovery', 'Evaluation', 'Production', 'Communication']) {
    await page.getByRole('group', { name: dim, exact: true }).getByRole('textbox').fill(`Quoted line for ${dim}`)
  }
  await page.getByRole('button', { name: 'Save full round score' }).click()
  // Mean 3.5 passes the mean bar, but Security at 1 is below the floor of 2.
  const result = page.getByText('Last saved, full round: Not yet, mean 3.5 of 5')
  await expect(result).toBeVisible()
  expect(Object.keys(await fdStorage(page))).toContain('fd:v1:learn:attempts:mock:internal-knowledge-assistant-mock-interview:full')

  await page.reload()
  await hydrated(page)
  await full.click()
  await expect(result).toBeVisible()
  await expect(page.getByText(/^Weakest dimension:/)).toContainText('Security')
})

test('interview rounds: /interview → round → a mock; planned and unknown rounds 404; old hubs redirect', async ({ page }) => {
  await page.goto('/interview')
  const rounds = page.getByRole('list', { name: 'Interview rounds' })
  await expect(rounds.getByRole('heading', { level: 2 })).toHaveCount(8)
  await expect(rounds.getByRole('article').filter({ hasText: 'Coming soon' }).getByRole('link')).toHaveCount(0)

  await rounds.getByRole('link', { name: 'AI System Design' }).click()
  await expect(page).toHaveURL('/interview/rounds/ai-system-design')
  await expect(page.getByRole('heading', { level: 1, name: 'AI System Design' })).toBeVisible()

  await page.getByRole('region', { name: 'Mock Interview' }).getByRole('link', { name: /Internal Knowledge Assistant Mock Interview/ }).click()
  await expect(page).toHaveURL(MOCK_LESSON)

  expect((await page.request.get('/interview/rounds/ai-assisted-coding')).status()).toBe(404)
  expect((await page.request.get('/interview/rounds/no-such-round')).status()).toBe(404)
  await page.goto('/interview/hubs/ai-systems-design')
  await expect(page).toHaveURL('/interview/rounds/ai-system-design')
})

test('progress: empty first, then readiness and the revision queue follow what the learner does', async ({ page }) => {
  await page.goto('/progress')
  await hydrated(page)
  await expect(page.getByRole('heading', { name: 'Nothing to Show Yet' })).toBeVisible()
  await expect(page.getByText(/^No score yet/)).toBeVisible()

  // A confidence rating of 2 puts the module in the revision queue.
  const confidence = page.getByRole('group', { name: 'How confident are you with this module?' })
  await page.goto(READY_MODULE)
  await hydrated(page)
  await confidence.getByText('Shaky').click()
  await expect(page.getByText('Confidence set to 2 of 5.')).toBeVisible()

  await page.goto(MOCK_LESSON)
  await hydrated(page)
  await page.getByText('Full round (6 dimensions)', { exact: true }).click()
  for (const dim of ['Discovery', 'Architecture', 'Security', 'Evaluation', 'Production', 'Communication']) {
    const group = page.getByRole('group', { name: dim, exact: true })
    await group.getByText('5', { exact: true }).click()
    await group.getByRole('textbox').fill(`Quoted line for ${dim}`)
  }
  await page.getByRole('button', { name: 'Save full round score' }).click()
  await expect(page.getByText(/^Last saved, full round: Pass/)).toBeVisible()

  // One of ten scored mocks (five scenario, five client simulations) at 5 of 5 is 10 %. With mocks the
  // only measured input, no headline score shows yet (FV-07).
  await page.goto('/progress')
  await hydrated(page)
  const readiness = page.getByRole('region', { name: 'Interview Readiness' })
  await expect(readiness).toContainText('Not enough data yet: 1 of 4 inputs measured (Mock interviews, 10 %)')
  await expect(readiness.getByText(/based on \d of 4 inputs/)).toHaveCount(0)
  await expect(page.getByRole('region', { name: /^Revision Queue/ })).toContainText('Low confidence')

  // A second input (a passed checkpoint) brings the headline score.
  await page.goto(CHECKPOINT_MODULE)
  await hydrated(page)
  await takeCheckpoint(page, true)
  await expect(page.getByText('Passed: 100 % (8 of 8)')).toBeVisible()
  await page.goto('/progress')
  await hydrated(page)
  await expect(readiness).toContainText('based on 2 of 4 inputs')
  await expect(readiness.getByRole('progressbar', { name: /^Interview readiness \d+ %$/ })).toBeVisible()

  // Rating 3 or more takes it out of the queue.
  await page.goto(READY_MODULE)
  await hydrated(page)
  await confidence.getByText('Getting there').click()
  await expect(page.getByText('Confidence set to 3 of 5.')).toBeVisible()
  await page.goto('/progress/revision')
  await hydrated(page)
  await expect(page.getByText('Nothing to revise.')).toBeVisible()
})

/** Answers the T2.4 checkpoint, correctly or with the first wrong option, and submits. */
async function takeCheckpoint(page: Page, correct: boolean) {
  const items = CHECKPOINTS.find((c) => c.module === 'retrieval-hybrid-rerank')!.items
  for (const [n, item] of items.entries()) {
    const option = correct ? item.options.find((o) => o.id === item.correctOptionId)! : item.options.find((o) => o.id !== item.correctOptionId)!
    await page.getByRole('group', { name: `${n + 1}. ${item.prompt}`, exact: true }).getByRole('radio', { name: option.text, exact: true }).check()
  }
  await page.getByRole('button', { name: 'Submit checkpoint' }).click()
}

test('checkpoint: a pass feeds readiness; a fail puts the module in the revision queue', async ({ page }) => {
  await page.goto(CHECKPOINT_MODULE)
  await hydrated(page)
  await page.getByRole('button', { name: 'Submit checkpoint' }).click()
  await expect(page.getByText(/^Answer every question first/)).toBeVisible()

  await takeCheckpoint(page, true)
  await expect(page.getByText('Passed: 100 % (8 of 8)')).toBeVisible()

  await page.goto('/progress')
  await hydrated(page)
  const readiness = page.getByRole('region', { name: 'Interview Readiness' })
  await expect(readiness).toContainText('Not enough data yet: 1 of 4 inputs measured')
  await expect(readiness).toContainText('Checkpoint pass rate100 %')

  await page.goto(CHECKPOINT_MODULE)
  await hydrated(page)
  await expect(page.getByText(/^Last attempt: 100 %, passed/)).toBeVisible()
  await takeCheckpoint(page, false)
  await expect(page.getByText('Not passed yet: 0 % (0 of 8)')).toBeVisible()

  await page.goto('/progress')
  await hydrated(page)
  await expect(page.getByRole('region', { name: /^Revision Queue/ })).toContainText('Checkpoint not passed (0 %)')
  await expect(page.getByRole('region', { name: 'Next Up' })).toContainText('checkpoint did not pass')
})

test('retired /demo URLs redirect home in one hop', async ({ page }) => {
  for (const path of ['/demo', '/demo/progress/history']) {
    const res = await page.request.get(path, { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(res.headers().location).toBe('/')
  }
})

test('the old onboarding pages redirect to /start in one hop (ON-01)', async ({ page }) => {
  for (const path of ['/guide', '/learning-map']) {
    const res = await page.request.get(path, { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(res.headers().location).toBe('/start')
  }
  await page.goto('/start')
  await expect(page.getByRole('heading', { name: 'How the Site Works' })).toBeVisible()
})

test('first visit: no module shows a blocked suggestion on paths and hubs (FV-01)', async ({ page }) => {
  for (const path of ['/start/paths/fde', '/design', '/interview']) {
    await page.goto(path)
    await hydrated(page)
    await expect(page.getByText(/^Suggested: read /)).toHaveCount(0)
  }
  // The badges did render: a first visitor sees "Not started", not a skeleton.
  await page.goto('/start/paths/fde')
  await hydrated(page)
  await expect(page.getByText('Not started', { exact: true }).first()).toBeVisible()
})

test('soft gating: blocked module → open anyway → remembered after reload', async ({ page }) => {
  // Before the learner starts anything, the module is not marked blocked; the card still suggests the prerequisite.
  await page.goto(GATED_MODULE)
  await hydrated(page)
  await expect(page.getByRole('heading', { name: 'Finish these first' })).toBeVisible()
  await expect(page.getByText('Suggested: read APIs and backend for AI apps first')).toHaveCount(0)

  // After reading one lesson, the module's badge names the unmet prerequisite.
  await page.goto(LESSON)
  await hydrated(page)
  await page.getByRole('button', { name: 'Mark read' }).click()
  await expect(page.getByRole('button', { name: 'Mark unread' })).toBeVisible()
  await page.goto(GATED_MODULE)
  await hydrated(page)
  await expect(page.getByText('Suggested: read APIs and backend for AI apps first').first()).toBeVisible()

  await page.getByRole('button', { name: 'Open anyway' }).click()
  await expect(page.getByRole('heading', { name: 'Opened before its prerequisites' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Opened before its prerequisites' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open anyway' })).toHaveCount(0)
})

test('settings: export → reset → import restores progress exactly', async ({ page }) => {
  await page.goto(LESSON)
  await hydrated(page)
  await page.getByRole('button', { name: 'Mark read' }).click()
  await expect(page.getByRole('button', { name: 'Mark unread' })).toBeVisible()
  // The storage probe key comes and goes; everything else must survive the round trip.
  const progress = async () => Object.fromEntries(Object.entries(await fdStorage(page)).filter(([k]) => k !== 'fd:v1:probe'))
  const before = await progress()
  expect(Object.keys(before).some((k) => k.startsWith('fd:v1:learn:lesson:'))).toBe(true)

  await page.goto('/settings')
  await hydrated(page)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export progress' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^forward-deployed-progress-\d{4}-\d{2}-\d{2}\.json$/)
  const file = await download.path()

  await page.getByRole('button', { name: 'Reset progress' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Reset progress' }).click()
  await expect(page.getByText('Progress reset.')).toBeVisible()
  expect(await progress()).toEqual({})

  await page.locator('input[type="file"]').setInputFiles(file)
  await page.getByRole('dialog').getByRole('button', { name: 'Replace progress' }).click()
  await expect(page.getByText(/^Progress imported/)).toBeVisible()
  expect(await progress()).toEqual(before)
})

test('settings: a file from elsewhere is rejected and nothing changes', async ({ page }) => {
  await page.goto('/settings')
  await hydrated(page)
  await page.locator('input[type="file"]').setInputFiles({
    name: 'notes.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ app: 'something-else', version: 1, data: {} })),
  })
  await expect(page.getByText('Import failed. Nothing was changed.')).toBeVisible()
  await expect(page.getByText(/was not exported from Forward Deployed/)).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('regression: a live worksheet still saves answers to its fd:v1 key', async ({ page }) => {
  await page.goto(WORKSHEET)
  await hydrated(page)
  const answer = `e2e answer ${Date.now()}`
  const field = page.locator('textarea').first()
  await field.fill(answer)

  await expect
    .poll(async () => Object.entries(await fdStorage(page)).find(([k, v]) => k.startsWith('fd:v1:answers:') && v.includes(answer)))
    .toBeTruthy()

  await page.reload()
  await expect(page.locator('textarea').first()).toHaveValue(answer)
})

test('search: ⌘K finds a lesson and Enter opens it', async ({ page }) => {
  await page.goto('/')
  await hydrated(page)
  await page.keyboard.press('ControlOrMeta+k')
  const box = page.getByRole('combobox', { name: 'Search the site' })
  await expect(box).toBeFocused()
  await box.fill(LESSON_TITLE)
  // Modules can outrank the lesson; arrow down to the lesson's result, then Enter.
  const options = page.getByRole('option')
  await expect(options.filter({ hasText: LESSON_TITLE }).first()).toBeVisible()
  const texts = await options.allTextContents()
  const index = texts.findIndex((t) => t.startsWith(LESSON_TITLE))
  expect(index).toBeGreaterThanOrEqual(0)
  for (let i = 0; i < index; i++) await page.keyboard.press('ArrowDown')
  await expect(options.nth(index)).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(LESSON)
})

test('theme toggle persists across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await hydrated(page)
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/\bdark\b/)

  await page.getByRole('button', { name: 'Switch between light and dark theme' }).click()
  await expect(html).toHaveClass(/\bdark\b/)
  await page.reload()
  await expect(html).toHaveClass(/\bdark\b/)
  expect((await fdStorage(page))['fd:v1:theme']).toBe('dark')

  await page.getByRole('button', { name: 'Switch between light and dark theme' }).click()
  await page.reload()
  await expect(html).not.toHaveClass(/\bdark\b/)
})

// ENH-16: the casebook moved to /design/<slug>. The old URL lands on the new page, and
// progress saved before the move still shows: it keys on theme/slug, not on the URL.
test('casebook: old case URL redirects and saved progress survives the move', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('fd:v1:read:knowledge-retrieval/enterprise-knowledge-assistant', JSON.stringify(['main']))
  })
  await page.goto('/modules/15-fde-case-studies/knowledge-retrieval/enterprise-knowledge-assistant')
  await expect(page).toHaveURL(CASE_STUDY)
  await hydrated(page)
  await (await caseContents(page)).getByRole('button', { name: /^Interview Guide( \d+ min)?$/ }).click()
  await expect(page.getByRole('button', { name: 'Interview Guide part 1 marked as read' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Casebook' })).toHaveAttribute('href', '/design')
  await page.goto('/learn/ai-systems-design/scenario-library')
  await expect(page).toHaveURL('/design')
  await expect(page.getByRole('heading', { level: 1, name: 'Casebook' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open Classic AI designs' })).toHaveAttribute('href', '/learn/ai-systems-design/classic-ai-designs')
})

// ENH-17: worksheets moved to /practice/<slug>. Answers key on track/slug, not the URL,
// so an answer saved under that key loads after following the old URL.
test('practice: old worksheet URL redirects and saved answers still load', async ({ page }) => {
  const key = 'fd:v1:answers:core/internal-knowledge-assistant'
  await page.goto(WORKSHEET)
  await hydrated(page)
  await page.locator('textarea').first().fill('saved before the move')
  await expect.poll(async () => (await fdStorage(page))[key]).toContain('saved before the move')
  const saved = (await fdStorage(page))[key]
  await page.evaluate(([k, v]) => {
    localStorage.clear()
    localStorage.setItem(k, v)
  }, [key, saved])

  await page.goto('/modules/01-customer-discovery-and-decomposition/core/internal-knowledge-assistant')
  await expect(page).toHaveURL(WORKSHEET)
  await hydrated(page)
  await expect(page.locator('textarea').first()).toHaveValue('saved before the move')
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Practice' })).toHaveAttribute('href', '/practice')
})

// ENH-18a: final-week reviews are lessons at /interview/final-week/<lesson>. Progress keys
// on module/lesson, so a review marked read before the move still shows read, and the
// one-page memory card is a tab that #recall-card opens.
test('final week: a review keeps saved progress, opens its recall card tab, and old URLs land there', async ({ page }) => {
  const review = '/interview/final-week/module-05-rag-and-enterprise-data'
  await page.addInitScript(() => {
    localStorage.setItem('fd:v1:learn:lesson:final-week/module-05-rag-and-enterprise-data', JSON.stringify({ readAt: new Date().toISOString() }))
  })
  await page.goto(review)
  await hydrated(page)
  await expect(page.getByRole('button', { name: 'Mark unread' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('tab', { name: 'Review' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#recall-card')).toBeHidden()

  await page.getByRole('tab', { name: 'Recall card' }).click()
  // The card's own heading: its diagrams add a closed full-size dialog with an h2 once they hydrate.
  await expect(page.locator('#recall-card').getByRole('heading', { level: 2, name: /^One-Page Memory Card/ })).toBeVisible()
  await expect(page).toHaveURL(`${review}#recall-card`)

  // ENH-18b: the retired static recall card redirects to that tab; the review keeps its
  // worksheet and design links from the old page's bar.
  await page.goto('/interview')
  await page.goto('/fde-last-day-prep/module-05-rag-and-enterprise-data/one-page-memory-card.html')
  await expect(page).toHaveURL(`${review}#recall-card`)
  await hydrated(page)
  await expect(page.getByRole('tab', { name: 'Recall card' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#recall-card')).toBeVisible()
  const practice = page.getByRole('complementary', { name: 'Practice for this review' })
  await expect(practice.getByRole('link').first()).toHaveAttribute('href', /^\/practice\//)
})

// ENH-21: design and worksheet twins, and a Learn classic design and its case, link both
// ways under the same labels, which also mark twins on the list pages.
test('twins: designs, worksheets and classic designs link both ways', async ({ page }) => {
  const twin = (label: string) => page.locator('p', { hasText: `${label}:` }).getByRole('link')
  const classic = '/learn/ai-systems-design/classic-ai-designs/logistics-exceptions-designing-around-a-policy-gate'
  await page.goto('/design/sales-copilot')
  await expect(twin('Practise this as a worksheet')).toHaveAttribute('href', '/practice/sales-copilot')
  await page.goto('/practice/sales-copilot')
  await expect(twin('Read the worked design')).toHaveAttribute('href', '/design/sales-copilot')
  await page.goto('/design/logistics-exception-handling')
  await expect(twin('Read the classic design')).toHaveAttribute('href', classic)
  await page.goto(classic)
  await expect(twin('Read the worked design')).toHaveAttribute('href', '/design/logistics-exception-handling')
  await page.goto('/design')
  await expect(page.getByRole('link', { name: 'Practise this as a worksheet →' }).first()).toHaveAttribute('href', /^\/practice\//)
})

// ENH-22b: pages in a sequence link to their neighbours; "Objectives" is the one label.
test('sequences: module pages and the Story Bank have prev and next', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Previous and next' })
  await page.goto(READY_MODULE)
  await expect(nav.locator('a[rel="next"]')).toHaveAttribute('href', /^\/learn\/orientation\//)
  await page.goto('/practice/story-bank')
  await expect(nav.locator('a[rel="next"]')).toHaveAttribute('href', /^\/practice\//)
  await page.goto('/learn/orientation')
  await expect(page.getByRole('heading', { name: 'Objectives' })).toBeVisible()
})

// ENH-23: /design filters by theme, level and time; chips count, the URL keeps the choice.
test('casebook filters: count, filter, survive a reload and clear', async ({ page }) => {
  await page.goto('/design')
  await hydrated(page)
  const filters = page.getByRole('group', { name: 'Filter designs' })
  const advanced = filters.getByRole('group', { name: 'Level' }).getByRole('button', { name: /^Advanced \(\d+\)$/ })
  const n = Number((await advanced.textContent())!.match(/\((\d+)\)/)![1])
  await advanced.click()
  await expect(page).toHaveURL(/level=advanced/)
  await expect(page.locator('#cases a[href^="/design/"]')).toHaveCount(n)
  await page.reload()
  await hydrated(page)
  await expect(advanced).toHaveAttribute('aria-pressed', 'true')

  await page.goto('/design?theme=model-development&level=foundation')
  await hydrated(page)
  await expect(page.getByText('No designs match these filters')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page).toHaveURL(/\/design$/)
})

// ENH-24a: diagrams fit their column at desktop and phone widths (PQ-13); one too wide
// to read at that size opens at full size in a dialog that closes on Escape.
for (const width of [1280, 390]) {
  test(`diagrams fit their column at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/design/decomposition-classics-67-68-69', '/learn/langchain-and-langgraph-fundamentals/lcel-runnables-and-chains/lcel-and-the-runnable-interface']) {
      await page.goto(path)
      const figures = page.locator('.mermaid-figure:visible')
      // Diagrams draw as they near the viewport (hidden tabs wait for their tab). Bring each
      // visible placeholder into view in turn, and give mermaid time on a loaded runner.
      const placeholders = page.locator('[role="status"]:visible', { hasText: 'Drawing diagram' })
      for (let n = await placeholders.count(); n > 0; n = await placeholders.count()) {
        await placeholders.first().scrollIntoViewIfNeeded()
        await expect.poll(() => placeholders.count(), { timeout: 30_000 }).toBeLessThan(n)
      }
      expect(await figures.count()).toBeGreaterThan(0)
      for (const figure of await figures.all()) {
        // A drawn diagram is an <img> (static SVG, ENH-24b) or an inline <svg> (fallback).
        const [drawnWidth, column] = await figure.evaluate((el) => {
          const drawn = [...el.querySelectorAll('img, svg')].find((d) => (d as HTMLElement).offsetParent !== null || d.getBoundingClientRect().width > 0)!
          return [drawn.getBoundingClientRect().width, el.clientWidth]
        })
        expect(drawnWidth).toBeLessThanOrEqual(column + 1)
      }
    }
    if (width === 390) {
      const open = page.getByRole('button', { name: 'Open full size' }).first()
      await open.click()
      const dialog = page.getByRole('dialog', { name: 'Diagram at full size' })
      await expect(dialog).toBeVisible()
      await expect(dialog.locator('img:visible, svg:visible')).toHaveCount(1)
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(open).toBeFocused()
    }
  })
}

// ENH-24b, PR-20: the served HTML holds each diagram as an image with a text alternative,
// before any JavaScript runs.
test('diagrams are in the served HTML', async ({ request }) => {
  const html = await (await request.get('/design/decomposition-classics-67-68-69')).text()
  expect(html).not.toContain('Drawing diagram')
  expect(html.match(/<img[^>]*src="\/diagrams\/[0-9a-f]+-light\.svg"[^>]*>/g)?.length).toBeGreaterThan(0)
  expect(html).toMatch(/<img[^>]*alt="Diagram: [^"]+"/)
  // Every tab's diagrams, not only the first tab's: the air-gapped case keeps its
  // diagrams on tutorial tabs that are hidden on load.
  const tabbed = await (await request.get('/design/air-gapped-ai-system')).text()
  expect(tabbed).not.toContain('h-40 rounded-lg border border-dashed')
  expect(new Set(tabbed.match(/\/diagrams\/[0-9a-f]+-light\.svg/g)).size).toBeGreaterThanOrEqual(8)
})

// PR-21: the 404 page is in the served HTML, before any JavaScript runs, for an
// unmatched URL and for an unknown param on a prerendered route.
for (const path of ['/no-such-page', '/learn/no-such-track', '/design/no-such-case', '/practice/no-such-worksheet']) {
  test(`404 HTML is server-rendered: ${path}`, async ({ request }) => {
    const res = await request.get(path)
    expect(res.status()).toBe(404)
    const html = await res.text()
    expect(html).not.toContain('__next_error__')
    expect(html).toMatch(/<h1[^>]*>Page Not Found<\/h1>/)
    for (const hub of ['/learn', '/design', '/practice', '/interview']) expect(html).toContain(`href="${hub}"`)
  })
}

// IA-12 and ON-05: a path lists modules in code order and never asks for one with no lessons.
test('path page: modules in code order, gap modules flagged Later', async ({ page }) => {
  await page.goto('/start/paths/beginner')
  // Each module row starts with its code in a span.
  const rows = page.locator('main ol > li > ul > li')
  const codes = await rows.evaluateAll((items) => items.map((li) => li.querySelector('span')?.textContent ?? ''))
  const t1 = codes.filter((c) => c.startsWith('T1.'))
  expect(t1).toEqual([...t1].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })))
  expect(t1.indexOf('T1.3')).toBeGreaterThan(-1)
  expect(t1.indexOf('T1.3')).toBeLessThan(t1.indexOf('T1.4'))
  const sql = rows.filter({ has: page.getByText('T1.4', { exact: true }) })
  // PathFlag renders "Flag:" for screen readers before the visible label.
  await expect(sql).toContainText(/Flag:\s*Later/)
  await expect(sql).not.toContainText(/Flag:\s*Required/)
})

// ON-03, ON-06, ON-07: the express lane, Frontier Lab hours and diagnostic links.
test('entry points: express lane, Frontier Lab hours, diagnostic links', async ({ page }) => {
  for (const path of ['/', '/start']) {
    await page.goto(path)
    await expect(page.getByRole('link', { name: 'Go straight to the final-week review' })).toHaveAttribute('href', '/interview/final-week')
  }
  await expect(page.getByRole('link', { name: 'Forward Deployed Engineer: Frontier Lab Loop' })).toBeVisible()
  await expect(page.getByText(/Loop variant of the .+ path/)).toBeVisible()
  await page.goto('/learn/orientation')
  await hydrated(page)
  // Sections start collapsed on narrow screens.
  const section = page.getByRole('button', { name: /^Getting started/ })
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  await expect(page.getByRole('link', { name: 'Path diagnostic' })).toHaveAttribute('href', '/start#diagnostic')
  await page.goto('/learn/orientation/how-the-platform-works')
  await expect(page.getByRole('link', { name: /Complete the path diagnostic/ })).toHaveAttribute('href', '/start#diagnostic')
})
