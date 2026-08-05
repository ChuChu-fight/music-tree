import { describe, expect, it } from 'vitest'
import { calculateStageProgress } from './childStageProgress'
import { STAGE_TARGETS, type StageProgressionInput } from './stageProgressionEngine'

const input = (): StageProgressionInput => ({ currentStage: 1, stageEntryDate: '2026-01-01', currentDate: '2026-01-31', practiceRecords: [], learningCycles: [], lessonEvaluations: [], completedPieces: [], concertRecords: [] })

describe('child stage progress', () => {
  it('caps displayed progress at 99 when one mandatory requirement is missing', () => {
    const value = input()
    const target = STAGE_TARGETS[1]
    value.practiceRecords = Array.from({ length: target.practiceDays }, (_, index) => ({ id: `p${index}`, date: `2026-01-${String(index + 2).padStart(2, '0')}`, minutes: 5, quality: 'focused' }))
    value.lessonEvaluations = Array.from({ length: target.cycles }, (_, index) => ({ id: `e${index}`, lessonDate: `2026-01-${String(index + 2).padStart(2, '0')}`, itemEvaluations: [{ homeworkItemId: `h${index}`, score: 60, improvement: 'clear', completed: true }] }))
    value.learningCycles = value.lessonEvaluations.map((lesson, index) => ({ id: `c${index}`, childId: 'child', startedAt: '2026-01-01', completedAt: lesson.lessonDate, homeworkItemIds: [`h${index}`], practiceRecordIds: [`p${index}`], teacherLessonEvaluationId: lesson.id, completedHomeworkItemIds: [`h${index}`], unfinishedHomeworkItemIds: [], status: 'completed' }))
    value.completedPieces = Array.from({ length: target.completedPieces - 1 }, (_, index) => ({ id: `piece${index}`, completionDate: '2026-01-20' }))
    const result = calculateStageProgress(value)
    expect(result.percentage).toBeLessThanOrEqual(99)
    expect(result.eligibleForNextStage).toBe(false)
  })

  it('shows 100 only when all six requirements pass', () => {
    const value = input()
    const target = STAGE_TARGETS[1]
    value.practiceRecords = Array.from({ length: target.practiceDays }, (_, index) => ({ id: `p${index}`, date: `2026-01-${String(index + 2).padStart(2, '0')}`, minutes: 5, quality: 'focused' }))
    value.lessonEvaluations = Array.from({ length: target.cycles }, (_, index) => ({ id: `e${index}`, lessonDate: `2026-01-${String(index + 2).padStart(2, '0')}`, itemEvaluations: [{ homeworkItemId: `h${index}`, score: 60, improvement: 'clear', completed: true }] }))
    value.learningCycles = value.lessonEvaluations.map((lesson, index) => ({ id: `c${index}`, childId: 'child', startedAt: '2026-01-01', completedAt: lesson.lessonDate, homeworkItemIds: [`h${index}`], practiceRecordIds: [`p${index}`], teacherLessonEvaluationId: lesson.id, completedHomeworkItemIds: [`h${index}`], unfinishedHomeworkItemIds: [], status: 'completed' }))
    value.completedPieces = Array.from({ length: target.completedPieces }, (_, index) => ({ id: `piece${index}`, completionDate: '2026-01-20' }))
    const result = calculateStageProgress(value)
    expect(result.percentage).toBe(100)
    expect(result.eligibleForNextStage).toBe(true)
  })

  it('fully configures Stage 4 to Stage 5', () => expect(calculateStageProgress({ ...input(), currentStage: 4 }).nextStage).toBe(5))
})
