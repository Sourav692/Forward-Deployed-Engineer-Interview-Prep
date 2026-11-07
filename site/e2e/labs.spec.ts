import { expect, test } from '@playwright/test'

// Phase 2 of the AI Engineering integration: course labs framed in lessons (FE-10, SEC-01).
const LESSON = '/learn/llm-and-retrieval/rag-from-first-principles/indexing-from-scratch-with-tf-idf-and-nearest-neighbours'
const LAB = '/labs/rag/m10_rag_lifecycle/top-k-retrieval-lab.html'

test('labs may be framed by the site only, make no requests and are not indexed', async ({ request }) => {
  const lesson = (await request.get(LESSON)).headers()['content-security-policy']
  expect(lesson).toContain("frame-ancestors 'none'")
  const lab = await request.get(LAB)
  expect(lab.headers()['content-security-policy']).toContain("frame-ancestors 'self'")
  expect(lab.headers()['content-security-policy']).toContain("connect-src 'none'")
  expect(lab.headers()['content-security-policy']).toContain('sandbox allow-scripts')
  expect(lab.headers()['x-robots-tag']).toBe('noindex')
  expect(await lab.text()).not.toContain('fonts.googleapis.com')
})

test('a lesson frames its lab, sized to the lab with no inner scrollbar', async ({ page }) => {
  await page.goto(LESSON)
  const iframe = page.locator('.cb-lab-frame iframe')
  await iframe.scrollIntoViewIfNeeded()
  await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts')
  await expect.poll(async () => (await iframe.boundingBox())?.height ?? 0, { timeout: 20_000 }).not.toBe(480)
  const lab = page.frameLocator('.cb-lab-frame iframe')
  await expect(lab.locator('html')).toHaveClass(/embedded/)
  const frame = page.frames().find((f) => f.url().endsWith(LAB))!
  expect(await frame.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)).toBeLessThanOrEqual(2)
  // The sandbox keeps the lab off this origin, so it cannot read the learner's progress.
  expect(await frame.evaluate(() => { try { return String(localStorage.length) } catch { return 'blocked' } })).toBe('blocked')
})

test('a lab opened full screen is sandboxed too', async ({ page }) => {
  await page.goto(LAB)
  expect(await page.evaluate(() => { try { return String(localStorage.length) } catch { return 'blocked' } })).toBe('blocked')
})

test('a framed lab follows the site theme', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fd:v1:theme', 'dark'))
  await page.goto(LESSON)
  await page.locator('.cb-lab-frame iframe').scrollIntoViewIfNeeded()
  await expect(page.frameLocator('.cb-lab-frame iframe').locator('html')).toHaveClass(/dark/, { timeout: 20_000 })
})

test('a lab that never reports its height falls back to a link', async ({ page }) => {
  test.setTimeout(60_000)
  await page.route('**/labs/rag/**', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>x</title><p>no script</p>' }))
  await page.goto(LESSON)
  await page.locator('.cb-lab-frame iframe').scrollIntoViewIfNeeded()
  await expect(page.locator('aside.cb-lab-card').getByRole('link', { name: /Open the lab/ })).toBeVisible({ timeout: 25_000 })
})
