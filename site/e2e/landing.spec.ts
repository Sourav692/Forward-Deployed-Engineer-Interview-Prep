import { expect, test } from '@playwright/test'
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
    const camera = page.getByTestId('journey-camera')
    const before = await camera.getAttribute('transform')
    await journey.getByRole('button', { name: '02 Design the system' }).click()
    await expect.poll(() => camera.getAttribute('transform')).not.toBe(before)
    await expect(journey.getByRole('button', { name: '02 Design the system' })).toHaveAttribute('aria-current', 'step')
    await journey.getByRole('button', { name: 'Use static view' }).click()
    await expect(journey.getByRole('img', { name: 'Discovery notes become a clear brief.' })).toBeVisible()
    await expect(journey.getByRole('img', { name: 'The brief becomes a connected architecture.' })).toBeVisible()
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
})

test('company prep offers a working next step while publication is paused', async ({ page }) => {
  await page.goto('/company-prep')
  await expect(page.getByText('Company packs are being prepared', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open Blitzy prep' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Explore interview preparation' }).click()
  await expect(page).toHaveURL('/interview')
})
