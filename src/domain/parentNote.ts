import type { PracticeRecord } from './types'

export const PARENT_NOTE_FALLBACK = 'Your music helped the tree glow today.'

export const selectLatestParentNote = (records: PracticeRecord[], today: string) => {
  const latest = records
    .filter((record) => record.date === today && record.parentNote.trim().length > 0)
    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt) || left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
    .at(-1)
  return latest?.parentNote.trim() ?? PARENT_NOTE_FALLBACK
}
