import type { LessonGroup } from '@/lib/curriculum-types'
import type { LearnLesson } from '@/lib/learn'
import { ReadingList } from './ReadingList'

/**
 * A module's reading list split into its named groups (the final week's Day 1 to Day 6),
 * each with its note. The lists are unnumbered: the group titles carry the order, and a
 * running count would clash with the review numbers the notes use. Each group's id is an
 * anchor the /interview hub links to.
 */
export function LessonGroups({ groups, lessons }: { groups: LessonGroup[]; lessons: LearnLesson[] }) {
  const bySlug = new Map(lessons.map((l) => [l.slug, l]))
  const lists = groups.map((g) => g.lessons.map((s) => bySlug.get(s)).filter((l): l is LearnLesson => !!l))
  return (
    <div className="space-y-8">
      {groups.map((g, i) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="scroll-mt-24">
          <h3 id={`${g.id}-title`} className="text-base font-semibold">
            {g.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted">{g.note}</p>
          <div className="mt-3">
            <ReadingList lessons={lists[i]} numbered={false} />
          </div>
        </section>
      ))}
    </div>
  )
}
