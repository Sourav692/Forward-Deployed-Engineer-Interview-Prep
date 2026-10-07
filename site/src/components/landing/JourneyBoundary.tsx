'use client'

import { Component, type ReactNode } from 'react'

/** A failed chunk or graphics context returns the reader to the static journey. */
export class JourneyBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onUnavailable() }
  render() { return this.state.failed ? null : this.props.children }
}
