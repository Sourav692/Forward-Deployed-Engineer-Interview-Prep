import { expect, test } from '@playwright/test'

test('Learn stages keep track filters and empty states working', async ({ page }) => {
  await page.goto('/learn')
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    '1.Start and Build Foundations',
    '2.Build AI Applications',
    '3.Make AI Production-Ready',
    '4.Design and Deliver for Customers',
    '5.Demonstrate Your Capability',
  ])
  await expect(main.getByRole('heading', { level: 3 })).toHaveCount(9)
  await page.goto('/learn?req=optional')
  await expect(main.getByRole('heading', { level: 3 })).toHaveCount(2)
  await expect(main.getByRole('heading', { name: '2.Build AI Applications', exact: true })).toHaveCount(0)
  await page.reload()
  await expect(main.getByRole('heading', { level: 3 })).toHaveCount(2)
  await page.goto('/learn?req=required&progress=completed')
  await expect(main.getByRole('heading', { level: 3 })).toHaveCount(0)
  await expect(main.getByRole('button', { name: 'Clear filters' })).toBeVisible()
  await main.getByRole('button', { name: 'Clear filters' }).click()
  await expect(main.getByRole('heading', { level: 3 })).toHaveCount(9)
})

test('track sections show the regrouped modules in teaching order', async ({ page }) => {
  for (const [track, sections] of [
    ['llm-and-retrieval', ['Model fundamentals', 'Build the retrieval pipeline', 'Framework implementation']],
    ['agentic-systems', ['Agent execution and tools', 'Context and memory', 'Reliable workflows and coordination']],
    ['production-ai', ['Security and governed data', 'Evaluation and safe releases', 'Operations and performance', 'Model adaptation']],
  ] as const) {
    await page.goto(`/learn/${track}`)
    for (const name of sections) await expect(page.getByRole('button', { name: new RegExp(`^${name}`) })).toBeVisible()
  }
  await page.goto('/learn/agentic-systems')
  const section = page.getByRole('button', { name: /^Reliable workflows and coordination/ })
  if ((await section.getAttribute('aria-expanded')) === 'false') await section.click()
  const links = page.locator('#reliable-and-multi-agent-systems').getByRole('link')
  const hrefs = await links.evaluateAll((elements) => elements.map((el) => el.getAttribute('href')))
  const workflow = hrefs.findIndex((href) => href?.endsWith('/agentic-workflow-platforms'))
  const multiAgent = hrefs.findIndex((href) => href?.endsWith('/multi-agent-systems'))
  expect(workflow).toBeGreaterThanOrEqual(0)
  expect(multiAgent).toBeGreaterThan(workflow)
})
