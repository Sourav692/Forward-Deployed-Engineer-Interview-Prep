import { permanentRedirect } from 'next/navigation'
import { LAST_DAY } from '@/lib/editorial'

/**
 * /interview/final-week is the sitemap name for the final-week review (plan §4). The
 * review already lives at /fde-last-day-prep, so this route redirects there (308)
 * rather than serving a copy. A page-level redirect keeps the rule next to the area
 * it belongs to, without touching next.config.
 */
export default function FinalWeekRedirect(): never {
  permanentRedirect(LAST_DAY.href)
}
