import { describe, expect, it } from 'vitest'
import { INITIAL_HEALTH, parentHealthContribution, replayHealth, teacherItemHealthContribution } from './health'
import type { HomeworkItemEvaluation, PracticeRecord, TeacherLessonEvaluation } from './types'

const practice = (overrides: Partial<PracticeRecord> = {}): PracticeRecord => ({ id: 'practice', childId: 'child', date: '2026-01-01', minutes: 10, quality: 'difficult', achievements: [], customAchievement: '', improvement: 'none', parentNote: '', createdAt: '2026-01-01T10:00:00.000Z', updatedAt: '2026-01-01T10:00:00.000Z', ...overrides })
const item = (overrides: Partial<HomeworkItemEvaluation> = {}): HomeworkItemEvaluation => ({ homeworkItemId: 'homework', score: 20, improvement: 'none', completed: false, ...overrides })
const lesson = (items: HomeworkItemEvaluation[], overrides: Partial<TeacherLessonEvaluation> = {}): TeacherLessonEvaluation => ({ id: 'lesson', childId: 'child', lessonDate: '2026-01-01', itemEvaluations: items, createdAt: '2026-01-01T15:00:00.000Z', ...overrides })

describe('deterministic Health replay', () => {
  it('starts at 80 and stays within 0 to 100', () => {
    expect(INITIAL_HEALTH).toBe(80)
    expect(replayHealth({ practiceRecords: [], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-01' }).currentHealth).toBe(80)
    expect(replayHealth({ practiceRecords: [], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-03-01' }).currentHealth).toBeGreaterThanOrEqual(0)
    expect(replayHealth({ practiceRecords: [practice({ quality: 'focused', achievements: ['assigned_section'], improvement: 'breakthrough' })], lessonEvaluations: [lesson([item({ score: 100, improvement: 'big', completed: true })])], currentDate: '2026-01-01' }).currentHealth).toBe(100)
  })

  it('applies one normal 80% carryover per empty date deterministically', () => {
    const firstDay = practice({ quality: 'focused', achievements: ['assigned_section'], improvement: 'none' })
    const result = replayHealth({ practiceRecords: [firstDay], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-04' })
    expect(result.days.map((day) => day.finalHealth)).toEqual([100, 80, 64, 51])
    expect(replayHealth({ practiceRecords: [firstDay], lessonEvaluations: [], anchorDate: '2026-01-01', currentDate: '2026-01-04' })).toEqual(result)
  })

  it('calculates Parent achievement contributions, including non-empty Other only', () => {
    expect(parentHealthContribution(practice())).toBe(5)
    expect(parentHealthContribution(practice({ achievements: ['assigned_section'] }))).toBe(10)
    expect(parentHealthContribution(practice({ achievements: ['other'], customAchievement: '' }))).toBe(5)
    expect(parentHealthContribution(practice({ achievements: ['other'], customAchievement: 'Kept a steady pulse' }))).toBe(10)
    expect(parentHealthContribution(practice({ achievements: ['assigned_section', 'played_whole_piece'] }))).toBe(10)
  })

  it.each([['difficult', 5], ['normal', 10], ['focused', 15]] as const)('maps %s Parent quality to +%s', (quality, expected) => expect(parentHealthContribution(practice({ quality }))).toBe(expected))
  it.each([['none', 0], ['small', 5], ['clear', 10], ['breakthrough', 15]] as const)('maps %s Parent improvement safely', (improvement, expected) => expect(parentHealthContribution(practice({ improvement }))).toBe(5 + expected))
  it('combines Parent achievement, quality, and improvement once', () => expect(parentHealthContribution(practice({ quality: 'focused', achievements: ['assigned_section'], improvement: 'clear' }))).toBe(30))

  it('uses raw Teacher stars, improvement, and completion bonus', () => {
    expect(teacherItemHealthContribution(item({ score: 20 }))).toBe(1)
    expect(teacherItemHealthContribution(item({ score: 100 }))).toBe(5)
    expect(teacherItemHealthContribution(item({ score: 60, improvement: 'small' }))).toBe(8)
    expect(teacherItemHealthContribution(item({ score: 60, improvement: 'clear' }))).toBe(13)
    expect(teacherItemHealthContribution(item({ score: 60, improvement: 'big' }))).toBe(18)
    expect(teacherItemHealthContribution(item({ score: 60, improvement: 'big', completed: true }))).toBe(33)
  })

  it.each([[20, 1], [40, 2], [60, 3], [80, 4], [100, 5]] as const)('maps Teacher score %s to raw %s-star Health', (score, expected) => expect(teacherItemHealthContribution(item({ score }))).toBe(expected))

  it('counts unfinished Teacher items without completion and combines multiple items', () => {
    const evaluation = lesson([item({ homeworkItemId: 'a', score: 40, improvement: 'small' }), item({ homeworkItemId: 'b', score: 80, improvement: 'clear', completed: true })])
    const result = replayHealth({ practiceRecords: [], lessonEvaluations: [evaluation], currentDate: '2026-01-01' })
    expect(result.days[0].teacherContribution).toBe(7 + 29)
    expect(result.currentHealth).toBe(100)
  })

  it('deduplicates persisted Parent and Teacher source IDs during replay', () => {
    const parent = practice()
    const teacher = lesson([item()])
    const result = replayHealth({ practiceRecords: [parent, { ...parent }], lessonEvaluations: [teacher, { ...teacher }], currentDate: '2026-01-01' })
    expect(result.days[0]).toMatchObject({ parentContribution: 5, teacherContribution: 1, finalHealth: 86 })
  })

  it('uses the earliest evidence date as deterministic legacy anchor', () => {
    const result = replayHealth({ practiceRecords: [practice({ date: '2026-01-03' })], lessonEvaluations: [lesson([item()], { lessonDate: '2026-01-02' })], currentDate: '2026-01-03' })
    expect(result.anchorDate).toBe('2026-01-02')
  })
})
