import { describe, expect, it } from 'vitest'
import { effectiveElapsedDays, isVacationDay, vacationAwareHealthCarryover, vacationDatesBetween, vacationStatus, vacationWeekKeys, validateVacationPeriod, type VacationPeriod } from './vacation'

const period = (overrides: Partial<VacationPeriod> = {}): VacationPeriod => ({ id: 'vacation_1', childId: 'child_001', startDate: '2026-08-10', endDate: '2026-08-12', createdAt: '2026-08-01T10:00:00Z', ...overrides })

describe('Urlaub calendar rules', () => {
  it('uses inclusive bounds without freezing adjacent dates', () => {
    expect(isVacationDay('2026-08-09', [period()])).toBe(false)
    expect(isVacationDay('2026-08-10', [period()])).toBe(true)
    expect(isVacationDay('2026-08-12', [period()])).toBe(true)
    expect(isVacationDay('2026-08-13', [period()])).toBe(false)
  })

  it('handles cancellation, early ending, statuses, and validation', () => {
    expect(isVacationDay('2026-08-10', [period({ cancelledAt: '2026-08-02T10:00:00Z' })])).toBe(false)
    expect(isVacationDay('2026-08-11', [period({ endedEarlyAt: '2026-08-11T08:00:00Z' })])).toBe(false)
    expect(vacationStatus(period(), '2026-08-01')).toBe('scheduled')
    expect(vacationStatus(period(), '2026-08-11')).toBe('active')
    expect(vacationStatus(period(), '2026-08-13')).toBe('completed')
    expect(vacationStatus(period({ cancelledAt: '2026-08-02' }), '2026-08-11')).toBe('cancelled')
    expect(validateVacationPeriod('', '')).toMatch(/start and end/i)
    expect(validateVacationPeriod('2026-08-12', '2026-08-10')).toMatch(/on or after/i)
  })

  it('counts overlaps once and excludes Urlaub from elapsed days and weeks', () => {
    const overlapping = [period(), period({ id: 'vacation_2', startDate: '2026-08-12', endDate: '2026-08-14' })]
    expect(vacationDatesBetween('2026-08-01', '2026-08-20', overlapping).size).toBe(5)
    expect(effectiveElapsedDays('2026-08-01', '2026-08-20', overlapping)).toBe(14)
    expect(vacationWeekKeys('2026-08-01', '2026-08-20', overlapping).size).toBeGreaterThan(0)
  })

  it('freezes Health carryover for consecutive Urlaub days and applies it once afterward', () => {
    expect(vacationAwareHealthCarryover(92, '2026-08-10', [period()])).toBe(92)
    expect(vacationAwareHealthCarryover(92, '2026-08-11', [period()])).toBe(92)
    expect(vacationAwareHealthCarryover(92, '2026-08-12', [period()])).toBe(92)
    expect(vacationAwareHealthCarryover(92, '2026-08-13', [period()])).toBe(74)
  })
})
