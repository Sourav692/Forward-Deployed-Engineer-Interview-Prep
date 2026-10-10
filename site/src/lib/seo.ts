import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from './editorial'

/**
 * Search-engine helpers (plan §11, SEO-01): the production origin, canonical and Open
 * Graph metadata, and schema.org JSON-LD objects. Rendered with `<JsonLd>`.
 */

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`

/**
 * Canonical URL plus Open Graph title, description, URL and image for one page.
 * A page's `openGraph` replaces the layout's, so the default share image
 * (`src/app/opengraph-image.tsx`) is named here or the page would have none.
 * `title` is left out on the home page, which keeps the layout's default title.
 */
export function pageMetadata({
  path,
  title,
  description,
  ogTitle = title,
  type = 'website',
}: {
  path: string
  title?: string
  description: string
  ogTitle?: string
  type?: 'website' | 'article'
}): Metadata {
  return {
    // An explicit `title: undefined` would wipe the layout's default title.
    ...(title && { title }),
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: ogTitle,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      type,
      locale: 'en_GB',
      images: '/opengraph-image',
    },
  }
}

/** The home page's `WebSite` object. */
export const webSiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'en-GB',
})

export type Crumb = { name: string; path: string }

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

const provider = () => ({ '@type': 'Organization', name: SITE_NAME, url: SITE_URL })

export function courseJsonLd({ name, description, path, code }: { name: string; description: string; path: string; code: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    courseCode: code,
    url: absoluteUrl(path),
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    provider: provider(),
  }
}

export function learningResourceJsonLd({
  name,
  description,
  path,
  minutes,
  partOf,
  type = 'Lesson',
}: {
  name: string
  description: string
  path: string
  minutes?: number
  /** schema.org `learningResourceType`. */
  type?: 'Lesson' | 'Case study' | 'Worksheet'
  /** The module the lesson belongs to. */
  partOf: { name: string; path: string }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name,
    description,
    url: absoluteUrl(path),
    learningResourceType: type,
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    ...(minutes ? { timeRequired: `PT${minutes}M` } : {}),
    isPartOf: { '@type': 'LearningResource', name: partOf.name, url: absoluteUrl(partOf.path) },
    provider: provider(),
  }
}
