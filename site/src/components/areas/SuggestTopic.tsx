import { suggestTopicHref } from '@/lib/editorial'

/** The hubs' one line asking for gaps, instead of Coming soon cards (FV-03, PR-15). */
export function SuggestTopic({ hub }: { hub: string }) {
  return (
    <p className="mt-10 text-sm text-muted">
      Missing a topic you need?{' '}
      <a href={suggestTopicHref(hub)} className="text-accent underline underline-offset-2 hover:text-accent-hover">
        Suggest the next topic
      </a>
      .
    </p>
  )
}
