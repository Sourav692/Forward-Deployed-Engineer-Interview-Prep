import { expect, test, type Page } from '@playwright/test'
import { CHECKPOINTS } from '../src/lib/checkpoints'
import {
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
  const follow = page.getByRole('button', { name: /^Start first module|^Choose this path/ })
  await tabTo(page, follow)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/learn\//)

  const stored = await fdStorage(page)
  expect(stored['fd:v1:path']).toBeTruthy()

  await page.goto('/learn')
  await expect(page.getByText('You are following the')).toBeVisible()
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

test('interview hubs: /interview → hub → a practice lesson; unknown hubs 404', async ({ page }) => {
  await page.goto('/interview')
  await page.getByRole('region', { name: 'Interview Topic Hubs' }).getByRole('link', { name: /^AI Systems Design/ }).click()
  await expect(page).toHaveURL('/interview/hubs/ai-systems-design')
  await expect(page.getByRole('heading', { level: 1, name: 'AI Systems Design' })).toBeVisible()

  await page.getByRole('region', { name: 'Practise' }).getByRole('link', { name: /Internal Knowledge Assistant Mock Interview/ }).click()
  await expect(page).toHaveURL(MOCK_LESSON)

  expect((await page.request.get('/interview/hubs/no-such-hub')).status()).toBe(404)
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

  // One of five mocks at 5 of 5 is 20 %. With mocks the only measured input, no headline score shows yet (FV-07).
  await page.goto('/progress')
  await hydrated(page)
  const readiness = page.getByRole('region', { name: 'Interview Readiness' })
  await expect(readiness).toContainText('Not enough data yet: 1 of 4 inputs measured (Mock interviews, 20 %)')
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

// PR-21: the 404 page is in the served HTML, before any JavaScript runs, for an
// unmatched URL and for an unknown param on a prerendered route.
for (const path of ['/no-such-page', '/learn/no-such-track', '/modules/15-fde-case-studies/core/no-such-case']) {
  test(`404 HTML is server-rendered: ${path}`, async ({ request }) => {
    const res = await request.get(path)
    expect(res.status()).toBe(404)
    const html = await res.text()
    expect(html).not.toContain('__next_error__')
    expect(html).toMatch(/<h1[^>]*>Page Not Found<\/h1>/)
    for (const hub of ['/learn', '/design', '/practice', '/interview']) expect(html).toContain(`href="${hub}"`)
  })
}

// ON-03, ON-06, ON-07: the express lane, Frontier Lab hours and diagnostic links.
test('entry points: express lane, Frontier Lab hours, diagnostic links', async ({ page }) => {
  for (const path of ['/', '/start']) {
    await page.goto(path)
    await expect(page.getByRole('link', { name: 'Go straight to the final-week review' })).toHaveAttribute('href', '/fde-last-day-prep')
  }
  await expect(page.getByText(/Frontier Lab Loop\s*\(about \d+ h\)/)).toBeVisible()
  await page.goto('/learn/orientation')
  await hydrated(page)
  // Sections start collapsed on narrow screens.
  const section = page.getByRole('button', { name: /^Orientation/ })
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  await expect(page.getByRole('link', { name: 'Path diagnostic' })).toHaveAttribute('href', '/start#diagnostic')
  await page.goto('/learn/orientation/how-the-platform-works')
  await expect(page.getByRole('link', { name: /Complete the path diagnostic/ })).toHaveAttribute('href', '/start#diagnostic')
})
