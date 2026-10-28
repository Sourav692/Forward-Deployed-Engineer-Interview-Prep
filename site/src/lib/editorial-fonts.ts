import { Bricolage_Grotesque, Source_Serif_4 } from 'next/font/google'

/**
 * The Editorial theme's faces (Hallmark), shared by the landing page and the casebook.
 * Declared once so both routes request the same font files; each route applies the
 * variables on its own wrapper, so the fonts ship only where the theme is used.
 * Variable fonts: `wdth` gives Bricolage its condensed magazine proportion, `opsz` its label cut.
 */
export const editorialDisplay = Bricolage_Grotesque({ subsets: ['latin'], axes: ['wdth', 'opsz'], variable: '--font-bricolage', display: 'swap' })
export const editorialSerif = Source_Serif_4({ subsets: ['latin'], axes: ['opsz'], style: ['normal', 'italic'], variable: '--font-source-serif', display: 'swap' })
