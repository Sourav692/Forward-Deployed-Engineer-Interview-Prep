import { expect, type Locator, type Page } from '@playwright/test'

/** Stable fixtures from `src/lib/curriculum.ts` (slugs never change; see CLAUDE.md). */
export const READY_MODULE = '/learn/orientation/the-fde-role'
export const LESSON = '/learn/orientation/the-fde-role/three-roles-three-questions'
export const LESSON_TITLE = 'Three Roles, Three Questions'
/** Ready module whose prerequisite (apis-and-backend) a fresh browser has not completed. */
export const GATED_MODULE = '/learn/engineering-foundations/distributed-systems-essentials'
export const COMING_SOON_MODULE = '/learn/engineering-foundations/sql-and-data-modelling'
export const WORKSHEET = '/modules/01-customer-discovery-and-decomposition/core/internal-knowledge-assistant'
/** Module with the T2.4 pilot checkpoint (DATA-10). */
export const CHECKPOINT_MODULE = '/learn/llm-and-retrieval/retrieval-hybrid-rerank'
/** A scenario mock lesson: it carries the mock timer and scorer (FE-15). */
export const MOCK_LESSON = '/interview/mock-interviews/internal-knowledge-assistant-mock-interview'
export const CASE_STUDY = '/modules/15-fde-case-studies/knowledge-retrieval/enterprise-knowledge-assistant'

/**
 * Waits until client islands have hydrated. Progress islands render a skeleton on the
 * server and swap in stored state after hydration; clicking before that is a no-op.
 */
export async function hydrated(page: Page) {
  await page.waitForLoadState('networkidle')
}

/** Presses Tab until `target` has focus (keyboard-only navigation), or fails. */
export async function tabTo(page: Page, target: Locator, max = 30) {
  for (let i = 0; i < max; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) return
    await page.keyboard.press('Tab')
  }
  await expect(target).toBeFocused()
}

/** Every `fd:v1:*` entry in localStorage. */
export function fdStorage(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const out: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!
      if (key.startsWith('fd:v1:')) out[key] = localStorage.getItem(key)!
    }
    return out
  })
}
