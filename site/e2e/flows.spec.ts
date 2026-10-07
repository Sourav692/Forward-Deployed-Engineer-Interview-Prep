import { expect, test } from '@playwright/test'
import {
  GATED_MODULE,
  LESSON,
  LESSON_TITLE,
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

test('soft gating: blocked module → open anyway → remembered after reload', async ({ page }) => {
  await page.goto(GATED_MODULE)
  await hydrated(page)
  await expect(page.getByRole('heading', { name: 'Finish these first' })).toBeVisible()
  await expect(page.getByText('Blocked').first()).toBeVisible()

  await page.getByRole('button', { name: 'Open anyway' }).click()
  await expect(page.getByRole('heading', { name: 'Opened before its prerequisites' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Opened before its prerequisites' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open anyway' })).toHaveCount(0)
})

test('storage portability: fd:v1 progress survives an export → clear → import round trip', async ({ page }) => {
  // Phase 1 has no Settings page (FE-17 is Phase 2), so export/import is exercised as
  // the same JSON shape `exportProgress` writes ({ app, version, exportedAt, data }),
  // round-tripped through localStorage. The bad-file guard UI is tested in Phase 2.
  await page.goto(LESSON)
  await hydrated(page)
  await page.getByRole('button', { name: 'Mark read' }).click()
  await expect(page.getByRole('button', { name: 'Mark unread' })).toBeVisible()

  const exported = await page.evaluate(() => {
    const data: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!
      if (key.startsWith('fd:v1:') && key !== 'fd:v1:probe') data[key] = localStorage.getItem(key)!
    }
    return JSON.stringify({ app: 'forward-deployed', version: 1, exportedAt: new Date().toISOString(), data })
  })
  const file = JSON.parse(exported)
  expect(file.app).toBe('forward-deployed')
  expect(Object.keys(file.data).some((k) => k.startsWith('fd:v1:learn:lesson:'))).toBe(true)

  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByRole('button', { name: 'Mark read' })).toBeVisible()

  await page.evaluate((json) => {
    const { data } = JSON.parse(json) as { data: Record<string, string> }
    for (const [key, value] of Object.entries(data)) localStorage.setItem(key, value)
  }, exported)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Mark unread' })).toBeVisible()
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
