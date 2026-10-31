import { expect, test } from '@playwright/test'

test('Learn lists eight topic groups as cards, with Coming soon for empty ones', async ({ page }) => {
  await page.goto('/learn')
  const groups = page.getByRole('list', { name: 'Topic groups' })
  await expect(groups.getByRole('heading', { level: 2 })).toHaveText([
    'Start here',
    'AI Engineering',
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
  await page.getByRole('link', { name: 'Agent Foundations for RAG', exact: true }).click()
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

test('AI Engineering lists the course tracks in part order, then production AI', async ({ page }) => {
  await page.goto('/learn/topics/ai-engineering')
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveText([
    'AI Engineering Foundations',
    'Prompt & Context Engineering',
    'LangChain & LangGraph Fundamentals',
    'RAG Foundations',
    'The Ingestion & Indexing Pipeline',
    'Retrieval Quality Engineering',
    'Building Complete RAG Applications',
    'Agent Foundations for RAG',
    'Agentic & Self-Correcting RAG',
    'Memory & Multi-Agent RAG',
    'Agent Protocols: MCP & A2A',
    'Hierarchical, Memory & Graph RAG',
    'Architecture Synthesis & Capstone',
    'Production AI Systems',
  ])
})

test('production AI starts with the agent engineering modules moved from agentic systems', async ({ page }) => {
  await page.goto('/learn/production-ai')
  const sections = ['Agent engineering in production', 'Security and governed data', 'Evaluation and safe releases', 'Operations and performance', 'Model adaptation']
  for (const name of sections) await expect(page.getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible()
  const section = page.getByRole('button', { name: /^Agent engineering in production/ })
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  const hrefs = await page.locator('#agent-engineering-in-production').getByRole('link').evaluateAll((elements) => elements.map((el) => el.getAttribute('href')))
  expect(hrefs.some((href) => href?.endsWith('/production-ai/agentic-workflow-platforms'))).toBe(true)
})
