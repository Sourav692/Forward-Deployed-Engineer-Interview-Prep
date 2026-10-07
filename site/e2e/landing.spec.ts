import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { WORKSHEET, fdStorage, hydrated } from './helpers'

test('practice preview requires a draft, preserves it, and lets the reader self-score', async ({ page }) => {
  await page.goto('/')
  await hydrated(page)
  const before = await fdStorage(page)
  const preview = page.getByRole('region', { name: 'Try a practice question' })
  await preview.getByRole('button', { name: 'Compare with a strong answer' }).click()
  await expect(preview.getByRole('alert')).toHaveText('Write a first thought before comparing.')
  await expect(preview.getByLabel('Your first move')).toBeFocused()
  const draft = 'I would identify the user, their task, permitted sources, and a measurable pilot outcome.'
  await preview.getByLabel('Your first move').fill(draft)
  await preview.getByRole('button', { name: 'Compare with a strong answer' }).click()
  await expect(preview.getByRole('heading', { name: 'Compare the reasoning' })).toBeFocused()
  await expect(preview.getByText(draft)).toBeVisible()
  await preview.getByRole('button', { name: 'Score my answer' }).click()
  await expect(preview.getByText('Pick the description that fits. This is your self-assessment.')).toBeVisible()
  await preview.getByRole('radio', { name: /5\/5/ }).check()
  await expect(preview.getByText(/Your self-score: 5\/5/)).toBeVisible()
  expect(await fdStorage(page)).toEqual(before)
  await preview.getByRole('button', { name: 'Try again' }).click()
  await expect(preview.getByLabel('Your first move')).toHaveValue(draft)
  await preview.getByRole('button', { name: 'Compare with a strong answer' }).click()
  await preview.getByRole('button', { name: 'Score my answer' }).click()
  await preview.getByRole('link', { name: 'Open the full worksheet' }).click()
  await expect(page).toHaveURL(WORKSHEET)
})

test('journey moves continuously on desktop and has a usable static alternative', async ({ page }, info) => {
  await page.goto('/')
  await hydrated(page)
  const journey = page.getByRole('region', { name: 'Discovery to architecture journey' })
  if (info.project.name === 'mobile-375') {
    await expect(journey.getByRole('img', { name: 'Discovery notes become a clear brief.' })).toBeVisible()
    await expect(journey.getByRole('img', { name: 'The brief becomes a connected architecture.' })).toBeVisible()
    await expect(journey.getByRole('button', { name: 'Use static view' })).toBeHidden()
  } else {
    await journey.scrollIntoViewIfNeeded()
    const camera = journey.locator('canvas')
    await expect(camera).toHaveAttribute('data-rendered', 'true', { timeout: 15_000 })
    expect(await camera.evaluate((canvas: HTMLCanvasElement) => canvas.getContext('webgl2') !== null)).toBe(true)
    const before = await camera.getAttribute('data-camera-x')
    await journey.getByRole('button', { name: '02 Design the system' }).click()
    await expect.poll(() => camera.getAttribute('data-camera-x')).not.toBe(before)
    await expect(journey.getByRole('button', { name: '02 Design the system' })).toHaveAttribute('aria-current', 'step')
    await journey.getByRole('button', { name: 'Identity', exact: true }).click()
    await expect(journey.getByText('Check who is asking and which sources they are allowed to use.')).toBeVisible()
    await journey.getByRole('button', { name: 'Evaluation', exact: true }).focus()
    await expect(journey.getByText('Check correctness, access control, and failure cases before release.')).toBeVisible()
    await journey.getByRole('button', { name: 'Use static view' }).click()
    await expect(camera).toHaveCount(0)
    await expect(journey.getByRole('img', { name: 'Discovery notes become a clear brief.' })).toBeVisible()
    await expect(journey.getByRole('img', { name: 'The brief becomes a connected architecture.' })).toBeVisible()
    await journey.getByRole('button', { name: 'Use 3D view' }).click()
    await expect(camera).toHaveAttribute('data-rendered', 'true', { timeout: 15_000 })
  }
  await page.getByRole('link', { name: 'Skip journey' }).click()
  await expect(page.locator('#areas')).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1)
})

test('reduced motion presents both scenes without a pinned scroll sequence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await hydrated(page)
  const journey = page.getByRole('region', { name: 'Discovery to architecture journey' })
  await expect(journey.getByRole('img', { name: 'Discovery notes become a clear brief.' })).toBeVisible()
  await expect(journey.getByRole('img', { name: 'The brief becomes a connected architecture.' })).toBeVisible()
  await expect(journey.getByRole('button', { name: 'Use static view' })).toBeHidden()
  await expect(journey.locator('canvas')).toHaveCount(0)
})

test('missing WebGL returns to static scenes with working links', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile-375', 'mobile always uses the static journey')
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return Reflect.apply(original, this, [type, ...args])
    } as typeof original
  })
  await page.goto('/')
  const journey = page.getByRole('region', { name: 'Discovery to architecture journey' })
  await journey.scrollIntoViewIfNeeded()
  await expect(journey.getByText('Showing the static journey.')).toBeVisible({ timeout: 15_000 })
  await expect(journey.getByRole('img', { name: 'Discovery notes become a clear brief.' })).toBeVisible()
  await expect(journey.getByRole('img', { name: 'The brief becomes a connected architecture.' })).toBeVisible()
  await expect(journey).toHaveAttribute('data-motion', 'false')
  await journey.getByRole('link', { name: 'Explore worked designs' }).click()
  await expect(page).toHaveURL('/design')
})

test('3D is deferred until desktop readers approach the journey', async ({ page }, info) => {
  // Keep the journey below the observer's preload margin on the first visit.
  if (info.project.name === 'desktop-1280') await page.setViewportSize({ width: 1280, height: 600 })
  await page.goto('/')
  await hydrated(page)
  await expect(page.locator('canvas')).toHaveCount(0)
  const journey = page.getByRole('region', { name: 'Discovery to architecture journey' })
  await journey.scrollIntoViewIfNeeded()
  if (info.project.name === 'mobile-375') {
    await expect(journey.locator('canvas')).toHaveCount(0)
  } else {
    await expect(journey.locator('canvas')).toHaveAttribute('data-rendered', 'true', { timeout: 15_000 })
  }
})

test('lost graphics context removes the canvas and keeps the journey usable', async ({ page }, info) => {
  test.skip(info.project.name === 'mobile-375', 'mobile does not create a graphics context')
  await page.goto('/')
  const journey = page.getByRole('region', { name: 'Discovery to architecture journey' })
  await journey.scrollIntoViewIfNeeded()
  const canvas = journey.locator('canvas')
  await expect(canvas).toHaveAttribute('data-rendered', 'true', { timeout: 15_000 })
  await canvas.evaluate((element: HTMLCanvasElement) => element.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext())
  await expect(journey.getByText('Showing the static journey.')).toBeVisible()
  await expect(canvas).toHaveCount(0)
  await expect(journey).toHaveAttribute('data-motion', 'false')
})

for (const theme of ['light', 'dark'] as const) {
  test(`3D component controls are accessible in ${theme} theme`, async ({ page }, info) => {
    test.skip(info.project.name === 'mobile-375', 'mobile uses the audited static journey')
    await page.addInitScript((value) => localStorage.setItem('fd:v1:theme', value), theme)
    await page.goto('/')
    const journey = page.getByRole('region', { name: 'Discovery to architecture journey' })
    await journey.getByRole('button', { name: '02 Design the system' }).click()
    await expect(journey.locator('canvas')).toHaveAttribute('data-rendered', 'true', { timeout: 15_000 })
    await journey.getByRole('button', { name: 'Evaluation', exact: true }).click()
    const { violations } = await new AxeBuilder({ page }).include('[data-testid="journey-world"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')).toEqual([])
  })
}

test('company prep offers a working next step while publication is paused', async ({ page }) => {
  await page.goto('/company-prep')
  await expect(page.getByText('Company packs are being prepared', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open Blitzy prep' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Explore interview preparation' }).click()
  await expect(page).toHaveURL('/interview')
})
