import { expect, test } from '@playwright/test'

// Phase 3 of the AI Engineering integration: the course's animated diagrams in lessons (FE-12, FE-13).
// The M11 overview's lifecycle figure has 8 steps.
const LESSON = '/learn/llm-and-retrieval/rag-from-first-principles/rag-from-first-principles-overview'

test('an animated diagram steps through with its controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(LESSON)
  const fig = page.locator('figure.anim').first()
  await fig.scrollIntoViewIfNeeded()
  await expect(fig).toHaveClass(/is-anim/)
  await expect(fig).toHaveAttribute('data-step', '8')
  await fig.getByRole('button', { name: 'Previous' }).click()
  await expect(fig).toHaveAttribute('data-step', '7')
  await expect(fig.locator('.anim__steps button').nth(6)).toHaveAttribute('aria-current', 'step')
  await fig.locator('.anim__steps button').first().click()
  await expect(fig).toHaveAttribute('data-step', '1')
  await expect(fig.locator('.in-2').first()).toHaveCSS('opacity', '0')
  await fig.getByRole('button', { name: 'Next' }).click()
  await expect(fig).toHaveAttribute('data-step', '2')
  await expect(fig.locator('.in-2').first()).toHaveCSS('opacity', '1')
})

test('an animated diagram plays on screen, and never by itself under reduced motion', async ({ page }) => {
  await page.goto(LESSON)
  const fig = page.locator('figure.anim').first()
  await fig.scrollIntoViewIfNeeded()
  await expect(fig.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expect(fig).not.toHaveAttribute('data-step', '8')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await fig.scrollIntoViewIfNeeded()
  await expect(fig).toHaveClass(/is-anim/)
  await page.waitForTimeout(3000)
  await expect(fig).toHaveAttribute('data-step', '8')
  await expect(fig.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-pressed', 'false')
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('an animated diagram shows its finished frame and its steps, with no controls', async ({ page }) => {
    await page.goto(LESSON)
    const fig = page.locator('figure.anim').first()
    await expect(fig).toBeVisible()
    await expect(fig.locator('.in-8').first()).toHaveCSS('opacity', '1')
    await expect(fig.locator('.anim__controls')).toBeHidden()
    await expect(fig.locator('.anim__steps li')).toHaveCount(8)
  })
})
