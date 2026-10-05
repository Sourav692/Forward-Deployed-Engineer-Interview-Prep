'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { newUser, safeNext } from '../auth'
import { signInAsDemo, signInAsNew, useDemo } from '../store/useDemo'
import { toast } from './feedback'
import { Card, ErrorState, btn } from './ui'
import { Input } from '@/components/ui'

/**
 * Mock sign-in. `useSearchParams` reads `?next=`; in Next 16 a client component using it
 * must sit inside a <Suspense> boundary so the rest of the page can still prerender.
 */
export function SignInForm() {
  const router = useRouter()
  const next = safeNext(useSearchParams().get('next'))
  const { signedIn, state } = useDemo()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a name and a valid-looking email address. Nothing is sent anywhere.')
    signInAsNew(newUser(name, email))
    toast(`Welcome, ${name.trim()}. Your progress starts empty.`)
    router.push(next)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <h2 className="font-semibold">Demo account</h2>
        <p className="mt-1 text-[0.875rem] text-muted">Alex Morgan (fictional): Applied AI Engineer targeting Forward Deployed Engineer roles, on the FDE path with the OpenAI / Anthropic variant. Pre-filled with progress so every state is visible.</p>
        {signedIn && state && <p className="mt-2 text-[0.8125rem] text-subtle">Currently signed in as {state.user.name}.</p>}
        <button
          type="button"
          className={`${btn.primary} mt-4`}
          onClick={() => {
            signInAsDemo()
            toast('Signed in as Alex Morgan (demo account).')
            router.push(next)
          }}
        >
          Continue as demo user
        </button>
      </Card>
      <Card>
        <h2 className="font-semibold">New learner</h2>
        <p className="mt-1 text-[0.875rem] text-muted">Creates an empty learner in this browser, to see the empty states. No password, no email is sent.</p>
        <form onSubmit={create} className="mt-3 space-y-3" noValidate>
          <div>
            <label htmlFor="name" className="text-[0.8125rem] font-semibold">
              Name
            </label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-1" />
          </div>
          <div>
            <label htmlFor="email" className="text-[0.8125rem] font-semibold">
              Email
            </label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-1" />
          </div>
          {error && <ErrorState title="Check the form" body={error} />}
          <button type="submit" className={btn.secondary}>
            Create learner
          </button>
        </form>
      </Card>
    </div>
  )
}
