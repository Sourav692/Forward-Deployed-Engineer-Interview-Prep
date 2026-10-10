import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/editorial'

/**
 * The default share image (audit check PR-02). A file-based metadata route at the
 * root segment, so every page inherits it as `og:image`, and Next renders it once
 * at build time. `ImageResponse` cannot read CSS variables, so the light-theme
 * tokens from globals.css are written out as hex.
 */

export const alt = `${SITE_NAME}: the AI system design and decomposition casebook for FDE interviews`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: '#fbfcfe',
          borderTop: '16px solid #5146d8',
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700, color: '#1d222b', letterSpacing: '-0.02em' }}>{SITE_NAME}</div>
        <div style={{ marginTop: 28, fontSize: 44, lineHeight: 1.3, color: '#5f6570', maxWidth: 900 }}>
          The AI system design and decomposition casebook for FDE interviews
        </div>
      </div>
    ),
    size,
  )
}
