import type { Metadata } from 'next'
import LearnModulePage, { generateMetadata as learnModuleMetadata } from '@/app/(site)/learn/[trackSlug]/[moduleSlug]/page'
import { INTERVIEW_TRACK, interviewModuleParams } from '@/lib/learn'

/**
 * Interview practice module page, e.g. /interview/mock-interviews. The interview
 * practice track is served here instead of /learn (see `src/lib/curriculum-href.ts`);
 * the page itself is the Learn module page, given the track id the URL leaves out.
 */

type Params = { moduleSlug: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return interviewModuleParams()
}

const withTrack = async (params: Promise<Params>) => ({ ...(await params), trackSlug: INTERVIEW_TRACK })

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return learnModuleMetadata({ params: withTrack(params) })
}

export default function InterviewModulePage({ params }: { params: Promise<Params> }) {
  return <LearnModulePage params={withTrack(params)} />
}
