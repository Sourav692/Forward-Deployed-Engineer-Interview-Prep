/**
 * Renders every ```mermaid fence in the synced content to static SVG files (ENH-24b,
 * audit check PR-20), so a page's HTML carries its diagrams instead of a placeholder that
 * only JavaScript can fill.
 *
 * - One file per fence and theme: `public/diagrams/<key>-light.svg` and `-dark.svg`,
 *   `<key>` from `diagramKey` (src/lib/diagram-key.ts). The page shows them as images
 *   and swaps them with the theme in CSS.
 * - Cached by key: only fences without both files are drawn, so an unchanged fence is
 *   never re-rendered and a sync on another machine (CI) changes nothing. Files whose
 *   fence is gone are removed.
 * - Drawn in one headless Chromium page (Playwright's, already a dev dependency) with
 *   the installed mermaid bundle, the site's colour tokens and an Arial-like font: an
 *   SVG shown as an image cannot load the page's web font, so it is measured and drawn
 *   in a font every system has. Labels are SVG text, not HTML (`htmlLabels: false`).
 * - `public/diagrams/index.json` maps each key to its natural `[width, height]`, rebuilt
 *   from the files on every run. The page uses it to size the image and to know a file
 *   exists; a fence without one falls back to drawing in the browser.
 * - No Chromium (a Vercel build) or a fence mermaid cannot parse: a warning, never a
 *   failed sync. `check:content` fails when a fence has no files.
 */
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { diagramKey, diagramSource } from '../src/lib/diagram-key.ts'
import { diagramThemeVariables } from '../src/lib/diagram-theme.ts'

const require = createRequire(import.meta.url)
const THEMES = ['light', 'dark']
const FONT = 'Arial, Helvetica, "Liberation Sans", sans-serif'

/** The ```mermaid fences of a markdown file, as the parsers see them (any indentation). */
export function mermaidFences(markdown) {
  const out = []
  const lines = markdown.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*(?:```|~~~)\s*mermaid\b/i.test(lines[i])) continue
    let j = i + 1
    while (j < lines.length && !/^\s*(?:```|~~~)/.test(lines[j])) j++
    out.push(lines.slice(i + 1, j).join('\n'))
    i = j
  }
  return out
}

/** Root <svg> sized to its viewBox, so the file has a natural size as an image; numbers rounded. */
function fixedSize(svg) {
  const viewBox = svg.match(/<svg[^>]*\bviewBox="([^"]+)"/)?.[1]
  if (!viewBox) return null
  const [, , w, h] = viewBox.split(/[\s,]+/).map(Number)
  const width = Math.ceil(w)
  const height = Math.ceil(h)
  const root = svg.match(/<svg[^>]*>/)[0]
  const sized = root
    .replace(/\swidth="[^"]*"/, '')
    .replace(/\sheight="[^"]*"/, '')
    .replace(/\sstyle="max-width:[^"]*"/, '')
    .replace(/^<svg/, `<svg width="${width}" height="${height}"`)
  // Mermaid writes coordinates to ~15 decimal places; a tenth of a pixel is enough.
  return { svg: svg.replace(root, sized).replace(/(\d\.\d)\d+/g, '$1'), width, height }
}

const sizeOf = (svg) => {
  const m = svg.match(/<svg[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/)
  return m ? [Number(m[1]), Number(m[2])] : null
}

async function draw(items, siteDir) {
  const { chromium } = await import('@playwright/test')
  const css = await readFile(join(siteDir, 'src', 'app', 'globals.css'), 'utf8')
  const tokens = [/^:root \{[\s\S]*?^\}/m, /^\.dark \{[\s\S]*?^\}/m].map((re) => css.match(re)?.[0] ?? '').join('\n')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(`<!doctype html><html><head><style>${tokens}\nbody { font-family: ${FONT}; }</style></head><body></body></html>`)
    await page.addScriptTag({ path: require.resolve('mermaid/dist/mermaid.min.js') })
    await page.addScriptTag({ content: `window.diagramThemeVariables = ${diagramThemeVariables.toString()}` })
    return await page.evaluate(
      async ({ items, themes, font }) => {
        const out = {}
        for (const theme of themes) {
          document.documentElement.classList.toggle('dark', theme === 'dark')
          const themeVariables = window.diagramThemeVariables(theme === 'dark', font)
          for (const { key, code } of items) {
            window.mermaid.initialize({
              startOnLoad: false,
              securityLevel: 'strict',
              suppressErrorRendering: true,
              theme: 'base',
              themeVariables,
              fontFamily: font,
              htmlLabels: false,
              flowchart: { htmlLabels: false },
              deterministicIds: true,
              deterministicIDSeed: `${key}-${theme}`,
              // Rounded shapes go through rough.js, which is random unless seeded.
              handDrawnSeed: 1,
            })
            out[key] ??= {}
            try {
              out[key][theme] = (await window.mermaid.render(`d${key}${theme}`, code)).svg
            } catch (err) {
              out[key].error = String(err?.message ?? err).split('\n')[0]
            }
          }
        }
        return out
      },
      { items, themes: THEMES, font: FONT },
    )
  } finally {
    await browser.close()
  }
}

export async function renderDiagrams({ siteDir }) {
  const contentDir = join(siteDir, 'content')
  const outDir = join(siteDir, 'public', 'diagrams')
  await mkdir(outDir, { recursive: true })

  const fences = new Map()
  for (const file of await readdir(contentDir, { recursive: true })) {
    if (!file.endsWith('.md')) continue
    for (const code of mermaidFences(await readFile(join(contentDir, file), 'utf8'))) {
      const key = diagramKey(code)
      if (!fences.has(key)) fences.set(key, diagramSource(code))
    }
  }
  const fileOf = (key, theme) => join(outDir, `${key}-${theme}.svg`)
  const missing = [...fences].filter(([key]) => THEMES.some((t) => !existsSync(fileOf(key, t))))

  let drawn = 0
  const failed = []
  if (missing.length) {
    let results = null
    try {
      results = await draw(missing.map(([key, code]) => ({ key, code })), siteDir)
    } catch (err) {
      console.warn(`diagrams: ${missing.length} not drawn, Chromium unavailable (${String(err.message).split('\n')[0]}); the page draws them instead`)
    }
    for (const [key, result] of Object.entries(results ?? {})) {
      if (result.error || THEMES.some((t) => !result[t])) {
        failed.push(`${key}: ${result.error ?? 'no output'}`)
        continue
      }
      for (const theme of THEMES) {
        const fixed = fixedSize(result[theme])
        if (fixed) await writeFile(fileOf(key, theme), `${fixed.svg}\n`)
      }
      drawn++
    }
  }

  // Remove files whose fence is gone; rebuild the size index from what is on disk.
  const index = {}
  for (const file of (await readdir(outDir)).sort()) {
    const m = file.match(/^([0-9a-f]+)-(light|dark)\.svg$/)
    if (!m) continue
    if (!fences.has(m[1])) {
      await rm(join(outDir, file))
      continue
    }
    if (m[2] === 'light' && existsSync(fileOf(m[1], 'dark'))) {
      const size = sizeOf(await readFile(join(outDir, file), 'utf8'))
      if (size) index[m[1]] = size
    }
  }
  await writeFile(join(outDir, 'index.json'), `${JSON.stringify(index, null, 1)}\n`)

  for (const f of failed) console.warn(`diagrams: could not draw ${f}`)
  return { total: fences.size, drawn, failed: failed.length, ready: Object.keys(index).length }
}
