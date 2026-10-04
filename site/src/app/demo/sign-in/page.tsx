import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignInForm } from '@/demo/components/SignInForm'
import { PageHeader, SkeletonCard } from '@/demo/components/ui'

export const metadata: Metadata = { title: 'Sign in' }

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Mock sign-in" title="Sign in to the prototype" description="There is no real account system. Sessions live in this browser under fd:demo:v1:session." />
      <Suspense fallback={<SkeletonCard />}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
