import { describe, expect, it } from 'vitest'
import { localCalendarDate } from './localCalendarDate'

describe('local calendar date', () => {
  it('uses the intended Europe/Berlin date on both sides of local midnight', () => {
    expect(localCalendarDate('2026-01-01T22:59:59.000Z', 'Europe/Berlin')).toBe('2026-01-01')
    expect(localCalendarDate('2026-01-01T23:00:00.000Z', 'Europe/Berlin')).toBe('2026-01-02')
  })
  it('resolves the same timestamp deterministically', () => expect(localCalendarDate('2026-07-01T22:30:00.000Z', 'Europe/Berlin')).toBe(localCalendarDate(new Date('2026-07-01T22:30:00.000Z'), 'Europe/Berlin')))
})
