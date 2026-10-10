import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from './editorial'

/**
 * Search-engine helpers (plan §11, SEO-01): the production origin, canonical and Open
 * Graph metadata, and schema.org JSON-LD objects. Rendered with `<JsonLd>`.
 */

export const absoluteUrl = (path: string) => `${SITE_URL}${path === '/' ? '' : path}`

/** Canonical URL plus Open Graph title, description and URL for one page. */
export function pageMetadata({
  path,
  title,
  description,
  ogTitle = title,
  type = 'website',
}: {
  path: string
  title: string
  description: string
  ogTitle?: string
  type?: 'website' | 'article'
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title: ogTitle, description, url: absoluteUrl(path), siteName: SITE_NAME, type, locale: 'en_GB' },
  }
}

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
}: {
  name: string
  description: string
  path: string
  minutes?: number
  /** The module the lesson belongs to. */
  partOf: { name: string; path: string }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name,
    description,
    url: absoluteUrl(path),
    learningResourceType: 'Lesson',
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    ...(minutes ? { timeRequired: `PT${minutes}M` } : {}),
    isPartOf: { '@type': 'LearningResource', name: partOf.name, url: absoluteUrl(partOf.path) },
    provider: provider(),
  }
}
