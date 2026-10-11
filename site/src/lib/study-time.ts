import type { CurriculumModule } from './curriculum-types'

export type StudyTime = { reading: number; practice: number; total: number }

/**
 * A module's study time in minutes (ENH-22, owner decision): the reading time of its
 * own published lessons, summed, plus its practice allowance (`practiceMinutes`, the time
 * worksheets, mocks or a build take beyond reading). A module with no lessons of its own
 * keeps its hand estimate (`estMinutes`), so borrowed lessons are not counted twice.
 *
 * `minutes` maps lesson slug to reading minutes, from the Learn sync manifest. No runtime
 * imports: the progress store, the pages and the check scripts all use it.
 */
export function studyTime(
  mod: Pick<CurriculumModule, 'lessons' | 'practiceMinutes' | 'estMinutes'>,
  minutes: Readonly<Record<string, number>>,
): StudyTime {
  const reading = mod.lessons.reduce((sum, slug) => sum + (minutes[slug] ?? 0), 0)
  if (!reading) return { reading: 0, practice: 0, total: mod.estMinutes ?? 0 }
  const practice = mod.practiceMinutes ?? 0
  return { reading, practice, total: reading + practice }
}
