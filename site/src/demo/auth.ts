/**
 * Mock authentication seam. There is no provider: a "session" is a small record in
 * `fd:demo:v1:session` naming the signed-in learner. Replace this module with a real
 * auth client later; callers only use the functions below.
 */
import type { User } from './types'
import { SESSION_KEY, readJson, removeKey, writeJson } from './store/persist'

export interface Session {
  userId: string
  signedInAt: string
}

export const DEMO_USER: User = {
  id: 'demo-alex',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  currentRole: 'Applied AI Engineer',
  targetRole: 'Forward Deployed Engineer',
  github: 'github.com/alex-morgan-demo',
  linkedin: 'linkedin.com/in/alex-morgan-demo',
  isDemo: true,
}

export function getSession(): Session | null {
  return readJson<Session>(SESSION_KEY)
}

export function signIn(userId: string): Session {
  const session = { userId, signedInAt: new Date().toISOString() }
  writeJson(SESSION_KEY, session)
  return session
}

export function signOut(): void {
  removeKey(SESSION_KEY)
}

/** A fresh, empty learner from the sign-in form: shows every empty state. */
export function newUser(name: string, email: string): User {
  const slug = email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    id: `user-${slug || 'learner'}`,
    name: name.trim() || 'New learner',
    email: email.trim(),
    currentRole: '',
    targetRole: '',
    github: '',
    linkedin: '',
    isDemo: false,
  }
}

/** Only same-origin relative paths are allowed as `?next=` targets. */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith('/demo') && !next.startsWith('//') ? next : '/demo/progress'
}
