/**
 * British spelling (ENH-26), shared by `check:content` (which flags American forms) and
 * the RAG theory import (which converts them), so the two cannot disagree. No runtime
 * imports: the `.mjs` scripts import this file.
 *
 * AMERICAN matches, as a whole word, the American forms of a fixed list of word families:
 * -ize/-yze verbs, -led/-ling, center, behavior and judgment.
 */
export const AMERICAN =
  /^(?:un|re|pre|de|mis)?(?:behaviors?|behavioral(?:ly)?|authoriz(?:e|es|ed|ing|ation|ations|er|ers)|optimiz(?:e|es|ed|ing|ation|ations|er|ers)|organiz(?:e|es|ed|ing|ation|ations|ational|er|ers)|judgments?|(?:normaliz|summariz|paralleliz|prioritiz|recogniz|utiliz|minimiz|maximiz|categoriz|standardiz|emphasiz|realiz|specializ|generaliz|finaliz|visualiz|customiz|memoriz|characteriz|centraliz|decentraliz|serializ|synchroniz|operationaliz|apologiz|criticiz|analyz|paralyz|catalyz)(?:e|es|ed|ing|ation|ations|er|ers|able)|(?:label|cancel|model|travel|signal|fuel|channel|level|total)(?:ed|ing|er|ers)|centers?|centered|centering)$/i

/** Product, title and pattern names that keep their own spelling. */
export const SPELLING_ALLOWED: [RegExp, string][] = [
  [/(?:Cost and )?Latency Optimization Playbook/g, 'title of a third-party playbook'],
  [/evaluator[-–]optimizer/gi, "Anthropic's name for a workflow pattern"],
  [/\bParallelization\b/g, "Anthropic's name for a workflow pattern"],
  [/\bauthorizer\b/g, "SQLite's name for its access-control callback"],
  [/\b(?:items|justify|place-items|self|text)-center\b/g, 'Tailwind utility class'],
]

/** The American words in `text`, skipping allowed names and paths or identifiers (`a_b`, `a/b`). */
export const americanWords = (text: string): string[] => {
  for (const [re] of SPELLING_ALLOWED) text = text.replace(re, ' ')
  return [...text.replace(/\S*[_/\\]\S*/g, ' ').matchAll(/[A-Za-z]+/g)].map((m) => m[0]).filter((w) => AMERICAN.test(w))
}

/** The British form of one word AMERICAN matches, keeping its capitalisation; other words unchanged. */
export function britishSpelling(word: string): string {
  if (!AMERICAN.test(word)) return word
  const british = word
    .toLowerCase()
    .replace(/behavior/, 'behaviour')
    .replace(/judgment/, 'judgement')
    .replace(/([iy])z(e|es|ed|ing|ation|ations|ational|er|ers|able)$/, (_, v: string, end: string) => `${v}s${end}`)
    .replace(/(label|cancel|model|travel|signal|fuel|channel|level|total)(ed|ing|er|ers)$/, '$1l$2')
    .replace(/center(s?)$/, 'centre$1')
    .replace(/center(ed|ing)$/, 'centr$1')
  if (word === word.toUpperCase()) return british.toUpperCase()
  return word[0] === word[0].toUpperCase() ? british[0].toUpperCase() + british.slice(1) : british
}
