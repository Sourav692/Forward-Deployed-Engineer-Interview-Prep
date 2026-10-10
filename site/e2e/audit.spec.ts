import { expect, test } from '@playwright/test'
import { CASE_STUDY, LESSON, READY_MODULE, WORKSHEET, hydrated, tabTo } from './helpers'

// A11Y-02 checks that can be automated (plan §11 "Manual checks per template"):
// reflow at 200 % and 400 % zoom, visible focus, and reduced motion. Screen-reader
// passes stay manual; see .website_spec/2026-10-05-phase-1-qa-report.md.

const TEMPLATES = ['/', '/start', '/learn', '/learn/orientation', READY_MODULE, LESSON, WORKSHEET, CASE_STUDY]

test.describe('reflow', () => {
  // 1280 px at 200 % zoom is a 640 CSS px viewport; at 400 % it is 320 CSS px (WCAG 1.4.10).
  for (const width of [640, 320]) {
    for (const path of TEMPLATES) {
      test(`${width}px ${path}`, async ({ page }, info) => {
        test.skip(info.project.name !== 'desktop-1280', 'viewport set per test; run once')
        await page.setViewportSize({ width, height: 800 })
        await page.goto(path)
        await hydrated(page)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        expect(overflow, `page scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1)
      })
    }
  }
})

// IA-01 and IA-15: six header links that fit at 1024 px, and Settings reachable at
// every width (footer on desktop, menu on mobile).
for (const width of [1024, 1280]) {
  test(`${width}px header has six links and Settings is in the footer`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-1280', 'viewport set per test; run once')
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    await hydrated(page)
    await expect(page.locator('header').getByRole('navigation').getByRole('link')).toHaveCount(6)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `page scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(1)
    await expect(page.locator('footer').getByRole('link', { name: 'Settings' })).toBeVisible()
  })
}

test('the mobile menu lists Settings', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile-375', 'the menu button shows below 1024 px')
  await page.goto('/')
  await hydrated(page)
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Settings' })).toBeVisible()
})

test('keyboard focus is visible on the skip link, nav and primary action', async ({ page }) => {
  await page.goto(LESSON)
  await hydrated(page)
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()

  const action = page.getByRole('button', { name: 'Mark read' })
  await tabTo(page, action, 80)
  const ring = await action.evaluate((el) => {
    const s = getComputedStyle(el)
    return s.outlineStyle !== 'none' || s.boxShadow !== 'none'
  })
  expect(ring).toBe(true)
})

test('reduced motion turns transitions and smooth scrolling off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(READY_MODULE)
  await hydrated(page)
  const motion = await page.evaluate(() => {
    const durations = [...document.querySelectorAll('a, button')]
      .slice(0, 50)
      .map((el) => parseFloat(getComputedStyle(el).transitionDuration) || 0)
    return { max: Math.max(0, ...durations), scroll: getComputedStyle(document.documentElement).scrollBehavior }
  })
  expect(motion.scroll).toBe('auto')
  expect(motion.max).toBeLessThanOrEqual(0.01)
})
