import { describe, expect, it } from 'vitest'
import { replayHealth } from './health'
import { selectDailyWater } from './water'
import type { PracticeRecord, TeacherLessonEvaluation } from './types'
import type { VacationPeriod } from './vacation'

const vacation = (overrides: Partial<VacationPeriod> = {}): VacationPeriod => ({ id: 'vacation', childId: 'child', startDate: '2026-01-02', endDate: '2026-01-04', createdAt: '2026-01-01T10:00:00.000Z', ...overrides })
const practice = (date: string, overrides: Partial<PracticeRecord> = {}): PracticeRecord => ({ id: `practice-${date}`, childId: 'child', date, minutes: 10, quality: 'normal', achievements: [], customAchievement: '', improvement: 'none', parentNote: '', createdAt: `${date}T10:00:00.000Z`, updatedAt: `${date}T10:00:00.000Z`, ...overrides })
const lesson = (date: string): TeacherLessonEvaluation => ({ id: `lesson-${date}`, childId: 'child', lessonDate: date, createdAt: `${date}T15:00:00.000Z`, itemEvaluations: [{ homeworkItemId: 'homework', score: 60, improvement: 'clear', completed: false }] })

describe('Urlaub-integrated Health replay', () => {
  it('freezes one or several vacation dates and applies one carryover afterward', () => {
    const firstDay = practice('2026-01-01', { quality: 'focused', achievements: ['assigned_section'] })
    const result = replayHealth({ practiceRecords: [firstDay], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-05', vacationPeriods: [vacation()] })
    expect(result.days.map((day) => day.finalHealth)).toEqual([100, 100, 100, 100, 80])
  })

  it('deduplicates overlapping periods through the existing Urlaub selector', () => {
    const result = replayHealth({ practiceRecords: [], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-05', vacationPeriods: [vacation(), vacation({ id: 'overlap', startDate: '2026-01-03', endDate: '2026-01-05' })] })
    expect(result.days.map((day) => day.finalHealth)).toEqual([80, 80, 80, 80, 80])
  })

  it('does not freeze cancelled periods', () => {
    const result = replayHealth({ practiceRecords: [], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-03', vacationPeriods: [vacation({ cancelledAt: '2026-01-01T12:00:00.000Z' })] })
    expect(result.days.map((day) => day.finalHealth)).toEqual([80, 64, 51])
  })

  it('freezes only through the effective early-ended date', () => {
    const result = replayHealth({ practiceRecords: [], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-04', vacationPeriods: [vacation({ endedEarlyAt: '2026-01-03T09:00:00.000Z' })] })
    expect(result.days.map((day) => day.finalHealth)).toEqual([80, 80, 64, 51])
  })

  it('allows optional practice to add Water and positive Health during Urlaub', () => {
    const vacationPractice = practice('2026-01-03')
    const result = replayHealth({ practiceRecords: [vacationPractice], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-03', vacationPeriods: [vacation({ startDate: '2026-01-03' })] })
    expect(result.days.map((day) => day.finalHealth)).toEqual([80, 64, 74])
    expect(selectDailyWater([vacationPractice], 'child', '2026-01-03')).toBe(2)
  })

  it('processes Teacher contributions normally during Urlaub', () => {
    const result = replayHealth({ practiceRecords: [], lessonEvaluations: [lesson('2026-01-03')], anchorDate: '2026-01-01', currentDate: '2026-01-03', vacationPeriods: [vacation({ startDate: '2026-01-03' })] })
    expect(result.days[2]).toMatchObject({ baseHealth: 64, teacherContribution: 13, finalHealth: 77 })
  })
})
