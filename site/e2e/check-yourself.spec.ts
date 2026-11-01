import { expect, test } from '@playwright/test'

// Phase 3 of the AI Engineering integration: every course lesson ends with three Check yourself
// questions whose answers open on demand (DATA-07).
const LESSON = '/learn/llm-and-retrieval/rag-from-first-principles/the-rag-lifecycle-and-a-measured-baseline'

test('a course lesson ends with three Check yourself questions, answers hidden until opened', async ({ page }) => {
  await page.goto(LESSON)
  const section = page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name: 'Check yourself' }) })
  const questions = section.locator('details')
  await expect(questions).toHaveCount(3)
  const first = questions.first()
  const answer = first.locator('p').first()
  await expect(answer).toBeHidden()
  await first.locator('summary').click()
  await expect(answer).toBeVisible()
  await expect(answer).toContainText('Print the retrieved chunks')
})

// The site's own lessons end with "Check Yourself" too; sync turns each answer into a reveal block (CT-13).
test('a site lesson hides its Check Yourself answers until opened', async ({ page }) => {
  await page.goto('/learn/production-ai/agentic-workflow-platforms/determinism-over-free-text')
  const section = page.locator('section').filter({ has: page.getByRole('heading', { level: 2, name: 'Check Yourself' }) })
  const first = section.locator('details').first()
  const answer = first.locator('p').first()
  await expect(answer).toBeHidden()
  await first.locator('summary').click()
  await expect(answer).toBeVisible()
})
