import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

/**
 * `/robots.txt` (plan §11, SEO-01). Everything is crawlable except the learner-only
 * pages, whose content lives in each reader's browser.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/progress', '/settings'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
