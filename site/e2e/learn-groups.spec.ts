import { expect, test } from '@playwright/test'

test('Learn lists nine topic groups as cards, with Coming soon for empty ones', async ({ page }) => {
  await page.goto('/learn')
  const groups = page.getByRole('list', { name: 'Topic groups' })
  await expect(groups.getByRole('heading', { level: 2 })).toHaveText([
    'Start here',
    'AI Engineering',
    'Production AI Engineering',
    'Harness Engineering',
    'Inference Engineering',
    'AI System Design',
    'Forward Deployed Engineering',
    'Coding',
    'Career',
  ])
  // Coming soon groups have no page, so their titles are not links.
  for (const name of ['Harness Engineering', 'Inference Engineering', 'Coding']) {
    await expect(groups.getByRole('link', { name, exact: true })).toHaveCount(0)
  }
  await expect(groups.getByText('Coming soon')).toHaveCount(3)
  // A live card opens its group page, and the group shows in the track's breadcrumb.
  await groups.getByRole('link', { name: 'AI Engineering', exact: true }).click()
  await expect(page).toHaveURL(/\/learn\/topics\/ai-engineering$/)
  await page.getByRole('link', { name: 'Agent Foundations', exact: true }).click()
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'AI Engineering' })).toHaveAttribute('href', '/learn/topics/ai-engineering')
})

test('a group page keeps track filters and empty states working', async ({ page }) => {
  await page.goto('/learn')
  await page.getByRole('link', { name: 'Start here', exact: true }).click()
  await expect(page).toHaveURL(/\/learn\/topics\/start-here$/)
  const main = page.getByRole('main')
  const cards = main.getByRole('heading', { level: 2 })
  await expect(cards).toHaveCount(2)
  await page.goto('/learn/topics/start-here?req=optional')
  await expect(cards).toHaveText(['Engineering Foundations for AI'])
  await page.reload()
  await expect(cards).toHaveCount(1)
  await page.goto('/learn/topics/start-here?req=required&progress=completed')
  await expect(cards).toHaveCount(0)
  await main.getByRole('button', { name: 'Clear filters' }).click()
  await expect(cards).toHaveCount(2)
})

test('Coming soon groups have no page', async ({ page }) => {
  const response = await page.goto('/learn/topics/coding')
  expect(response?.status()).toBe(404)
})

test('AI Engineering lists the course tracks in part order', async ({ page }) => {
  await page.goto('/learn/topics/ai-engineering')
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText([
    'AI Engineering Foundations',
    'Prompt & Context Engineering',
    'LLM Application Frameworks: LangChain & LangGraph',
    'RAG Foundations: Ingestion & Indexing',
    'Retrieval Quality & RAG Applications',
    'Agent Foundations',
    'Advanced Agents',
    'Agentic RAG',
    'The Memory Layer',
    'Multi-Agent Systems',
    'Agent Protocols: MCP & A2A',
    'Knowledge Graphs & GraphRAG',
    'Fine-Tuning & Model Adaptation',
    'Architecture Decisions',
  ])
})

test('Production AI Engineering is its own group with the production-ai track', async ({ page }) => {
  await page.goto('/learn')
  await page.getByRole('list', { name: 'Topic groups' }).getByRole('link', { name: 'Production AI Engineering', exact: true }).click()
  await expect(page).toHaveURL(/\/learn\/topics\/production-ai-engineering$/)
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText(['Production AI Engineering'])
  await page.getByRole('main').getByRole('link', { name: 'Production AI Engineering', exact: true }).click()
  await expect(page).toHaveURL(/\/learn\/production-ai$/)
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Production AI Engineering' })).toHaveAttribute(
    'href',
    '/learn/topics/production-ai-engineering',
  )
})

test('production AI starts with the agent engineering modules moved from agentic systems', async ({ page }) => {
  await page.goto('/learn/production-ai')
  const sections = [
    'Agent engineering in production',
    'Security and governed data',
    'Evaluation and safe releases',
    'Operations and performance',
    'Model adaptation',
    'Evaluation foundations',
    'Evaluating RAG',
    'Evaluating agents',
    'Release engineering',
    'Observability',
    'Safety and security',
    'Capstone',
  ]
  for (const name of sections) await expect(page.getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible()
  const section = page.getByRole('button', { name: /^Agent engineering in production/ })
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  const hrefs = await page.locator('#agent-engineering-in-production').getByRole('link').evaluateAll((elements) => elements.map((el) => el.getAttribute('href')))
  expect(hrefs.some((href) => href?.endsWith('/production-ai/agentic-workflow-platforms'))).toBe(true)
})

test('planned Production AI Engineering modules are Coming soon scaffolds with no lessons', async ({ page }) => {
  await page.goto('/learn/production-ai')
  const section = page.getByRole('button', { name: /^Evaluation foundations/ })
  await expect(section).toContainText('3 modules, coming soon')
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  await expect(page.locator('#evaluation-foundations').getByText('Coming soon').first()).toBeVisible()
  const response = await page.goto('/learn/production-ai/the-evaluation-lifecycle')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1, name: 'The evaluation lifecycle' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Lessons' })).toHaveCount(0)
  const note = page.locator('p', { hasText: 'Until this module is built, see' })
  await expect(note).toBeVisible()
  await expect(note.getByRole('link', { name: 'T16.7 Evaluation and release gates', exact: true })).toHaveAttribute(
    'href',
    '/learn/production-ai/evaluation-and-release-gates',
  )
  await expect(page.getByText('No other module covers this topic yet')).toHaveCount(0)
})
