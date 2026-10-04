/**
 * Tracks note editors with unsaved text, so sign-out can confirm before discarding.
 * Module state is enough here: it only needs to live as long as the tab.
 */
const dirty = new Set<string>()

export function setUnsaved(id: string, isDirty: boolean): void {
  if (isDirty) dirty.add(id)
  else dirty.delete(id)
}

export const hasUnsavedNotes = (): boolean => dirty.size > 0
