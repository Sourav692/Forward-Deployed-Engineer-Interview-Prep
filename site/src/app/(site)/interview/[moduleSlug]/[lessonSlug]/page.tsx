import type { Metadata } from 'next'
import LearnLessonPage, {
  generateMetadata as learnLessonMetadata,
} from '@/app/(site)/learn/[trackSlug]/[moduleSlug]/[lessonSlug]/page'
import { INTERVIEW_TRACK, interviewLessonParams } from '@/lib/learn'

/**
 * Interview practice lesson page, e.g. /interview/mock-interviews/<lesson>. The Learn
 * lesson page, given the track id the URL leaves out (see `src/lib/curriculum-href.ts`).
 */

type Params = { moduleSlug: string; lessonSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return interviewLessonParams()
}

const withTrack = async (params: Promise<Params>) => ({ ...(await params), trackSlug: INTERVIEW_TRACK })

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return learnLessonMetadata({ params: withTrack(params) })
}

export default function InterviewLessonPage({ params }: { params: Promise<Params> }) {
  return <LearnLessonPage params={withTrack(params)} />
}
