import { describe, expect, it } from 'vitest'
import type { PracticeRecord } from './types'
import { PARENT_NOTE_FALLBACK, selectLatestParentNote } from './parentNote'

const record = (id: string, date: string, note: string, updatedAt: string): PracticeRecord => ({ id, childId: 'child_001', date, minutes: 10, quality: 'normal', achievements: [], customAchievement: '', improvement: 'none', parentNote: note, createdAt: updatedAt, updatedAt })

describe('latest parent note', () => {
  it('selects the latest non-empty note for today deterministically', () => {
    expect(selectLatestParentNote([record('b', '2026-08-03', ' Later ', '2026-08-03T11:00:00Z'), record('a', '2026-08-03', 'Early', '2026-08-03T10:00:00Z')], '2026-08-03')).toBe('Later')
  })
  it('uses a friendly fallback for empty or previous-day notes', () => {
    expect(selectLatestParentNote([record('a', '2026-08-02', 'Yesterday', '2026-08-02T10:00:00Z')], '2026-08-03')).toBe(PARENT_NOTE_FALLBACK)
    expect(selectLatestParentNote([record('a', '2026-08-03', ' ', '2026-08-03T10:00:00Z')], '2026-08-03')).toBe(PARENT_NOTE_FALLBACK)
  })
  it('does not let a newer empty note hide an older non-empty note from today', () => {
    expect(selectLatestParentNote([
      record('older', '2026-08-03', 'Keep singing gently', '2026-08-03T10:00:00Z'),
      record('newer', '2026-08-03', '   ', '2026-08-03T12:00:00Z'),
    ], '2026-08-03')).toBe('Keep singing gently')
  })
})
