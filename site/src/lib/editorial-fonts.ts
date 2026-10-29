import { Bricolage_Grotesque } from 'next/font/google'

/**
 * The Editorial theme's display face (Hallmark), shared by the landing page and the editorial
 * areas. Declared once so every route requests the same font files; each route applies the
 * variable on its own wrapper. Body text is Inter, loaded site-wide in the root layout.
 * Variable fonts: `wdth` gives Bricolage its condensed magazine proportion, `opsz` its label cut.
 */
export const editorialDisplay = Bricolage_Grotesque({ subsets: ['latin'], axes: ['wdth', 'opsz'], variable: '--font-bricolage', display: 'swap' })
