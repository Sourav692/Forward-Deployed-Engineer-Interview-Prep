/**
 * Mermaid theme variables drawn from the site's colour tokens, for the current theme of
 * the document it runs in (`.dark` on <html>). Runs in a browser: the page's fallback
 * renderer (Diagram.tsx) and the sync-time renderer (scripts/render-diagrams.mjs, which
 * injects this function's source into Chromium) both call it, so the two agree.
 *
 * Self-contained on purpose (no imports, helpers inside): the sync renderer serialises it.
 *
 * Mermaid's stock palettes (lavender on pale yellow) read as a foreign object on the page,
 * so the diagram uses the site's tokens. No accent: the indigo is reserved for interactive
 * affordances and progress, and a diagram is neither.
 */
export function diagramThemeVariables(dark: boolean, fontFamily: string) {
  // The tokens are oklch(), which getComputedStyle serialises as lab(), a notation
  // mermaid cannot parse. Painting one pixel turns any colour space into sRGB hex.
  const token = (name: string): string => {
    const probe = document.createElement('div')
    probe.style.color = `var(${name})`
    document.body.appendChild(probe)
    const resolved = getComputedStyle(probe).color
    probe.remove()
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return resolved
    ctx.fillStyle = resolved
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
  }
  const text = token('--text')
  const surface = token('--surface-2')
  const cluster = token('--bg')
  return {
    darkMode: dark,
    fontFamily,
    fontSize: '15px',
    background: token('--surface'),
    primaryColor: surface,
    primaryTextColor: text,
    primaryBorderColor: token('--border-strong'),
    secondaryColor: cluster,
    tertiaryColor: cluster,
    mainBkg: surface,
    nodeBorder: token('--border-strong'),
    nodeTextColor: text,
    textColor: text,
    titleColor: text,
    lineColor: token('--text-muted'),
    edgeLabelBackground: token('--surface'),
    clusterBkg: cluster,
    clusterBorder: token('--border'),
  }
}
