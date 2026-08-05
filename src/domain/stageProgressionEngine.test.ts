import { describe, expect, it } from 'vitest'
import { createStageEntrySnapshot, evaluateStageProgression, hasQualifiedImprovement, isCompletedLearningCycle, isQualifiedLesson, lessonQuality, scaleTarget, selectValidPracticeDays, STAGE_TARGETS, type ProgressionLessonEvaluation, type StageProgressionInput } from './stageProgressionEngine'

const addDays = (date: string, days: number) => new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86_400_000).toISOString().slice(0, 10)
const completeInput = (stage: 1 | 2 | 3 | 4, start = '2026-01-01'): StageProgressionInput => {
  const target = STAGE_TARGETS[stage]
  const practiceRecords = Array.from({ length: target.practiceDays }, (_, index) => ({ id: `p${index}`, date: addDays(start, index + 1), minutes: 5, quality: 'normal' as const, valid: true, saved: true }))
  const lessonCount = Math.max(target.cycles, target.qualifiedLessons, target.qualifiedImprovements)
  const lessonEvaluations: ProgressionLessonEvaluation[] = Array.from({ length: lessonCount }, (_, index) => ({ id: `e${index}`, lessonDate: addDays(start, index + 2), itemEvaluations: [{ homeworkItemId: `h${index}`, score: 60, improvement: index < target.qualifiedImprovements ? 'clear' : 'small', completed: index % 2 === 0 }] }))
  const learningCycles = lessonEvaluations.slice(0, target.cycles).map((lesson, index) => ({ id: `c${index}`, childId: 'child', startedAt: start, completedAt: lesson.lessonDate, homeworkItemIds: [`h${index}`], practiceRecordIds: [`p${index}`], teacherLessonEvaluationId: lesson.id, completedHomeworkItemIds: index % 2 === 0 ? [`h${index}`] : [], unfinishedHomeworkItemIds: index % 2 === 0 ? [] : [`h${index}`], status: 'completed' as const }))
  const completedPieces = Array.from({ length: target.completedPieces }, (_, index) => ({ id: `piece${index}`, completionDate: addDays(start, index + 3) }))
  return { currentStage: stage, stageEntryDate: start, currentDate: addDays(start, target.days), practiceRecords, learningCycles, lessonEvaluations, completedPieces, concertRecords: [] }
}

describe('valid practice days', () => {
  it('requires at least five minutes and Parent quality', () => expect(selectValidPracticeDays([{ id: 'short', date: '2026-01-01', minutes: 4, quality: 'focused' }, { id: 'missing', date: '2026-01-02', minutes: 5 }, { id: 'valid', date: '2026-01-03', minutes: 5, quality: 'difficult' }]).map((item) => item.id)).toEqual(['valid']))
  it('counts several accepted records on one date once', () => expect(selectValidPracticeDays([{ id: 'a', date: '2026-01-01', minutes: 5, quality: 'normal' }, { id: 'b', date: '2026-01-01', minutes: 20, quality: 'focused' }])).toHaveLength(1))
})

describe('completed learning cycles', () => {
  const lesson: ProgressionLessonEvaluation = { id: 'lesson', lessonDate: '2026-01-05', itemEvaluations: [{ homeworkItemId: 'homework', score: 60, improvement: 'small', completed: false }] }
  const practice = [{ id: 'practice', date: '2026-01-03', minutes: 5, quality: 'normal' as const }]
  const cycle = { id: 'cycle', childId: 'child', startedAt: '2026-01-01', completedAt: '2026-01-05', homeworkItemIds: ['homework'], practiceRecordIds: ['practice'], teacherLessonEvaluationId: 'lesson', completedHomeworkItemIds: [], unfinishedHomeworkItemIds: ['homework'], status: 'completed' as const }
  it('accepts a complete cycle including unfinished carryover', () => expect(isCompletedLearningCycle(cycle, practice, lesson)).toBe(true))
  it('rejects missing homework, practice, lesson, or resolved status', () => { expect(isCompletedLearningCycle({ ...cycle, homeworkItemIds: [] }, practice, lesson)).toBe(false); expect(isCompletedLearningCycle(cycle, [], lesson)).toBe(false); expect(isCompletedLearningCycle(cycle, practice)).toBe(false); expect(isCompletedLearningCycle({ ...cycle, unfinishedHomeworkItemIds: [] }, practice, lesson)).toBe(false) })
  it('counts maximum one cycle per LessonEvaluation', () => { const input = completeInput(1); input.learningCycles.push({ ...input.learningCycles[0], id: 'duplicate-cycle' }); expect(evaluateStageProgression(input).requirements.find((item) => item.id === 'learning-cycles')?.actual).toBe(STAGE_TARGETS[1].cycles) })
})

describe('teacher qualification', () => {
  const evaluation = (scores: Array<20 | 40 | 60 | 80 | 100>, improvements: Array<'none' | 'small' | 'clear' | 'big'> = scores.map(() => 'small')): ProgressionLessonEvaluation => ({ id: 'lesson', lessonDate: '2026-01-01', itemEvaluations: scores.map((score, index) => ({ homeworkItemId: `h${index}`, score, improvement: improvements[index], completed: false })) })
  it('requires an arithmetic mean strictly above 40', () => { expect(isQualifiedLesson(evaluation([40]))).toBe(false); expect(isQualifiedLesson(evaluation([60]))).toBe(true); expect(lessonQuality(evaluation([20, 60]))).toBe(40); expect(lessonQuality(evaluation([40, 60]))).toBe(50) })
  it('counts a multi-item LessonEvaluation once', () => { const input = completeInput(1); input.lessonEvaluations = [evaluation([60, 80])]; input.lessonEvaluations[0].id = 'only'; expect(evaluateStageProgression(input).requirements.find((item) => item.id === 'qualified-lessons')?.actual).toBe(1) })
  it('qualifies only clear or big improvement and once per lesson', () => { expect(hasQualifiedImprovement(evaluation([60, 60], ['none', 'small']))).toBe(false); expect(hasQualifiedImprovement(evaluation([60, 60], ['clear', 'big']))).toBe(true) })
})

describe('controlled target table', () => {
  it('uses the exact authoritative targets', () => expect(STAGE_TARGETS).toEqual({ 1: { days: 30, practiceDays: 18, cycles: 4, qualifiedLessons: 3, qualifiedImprovements: 2, completedPieces: 8 }, 2: { days: 36, practiceDays: 22, cycles: 5, qualifiedLessons: 4, qualifiedImprovements: 3, completedPieces: 10 }, 3: { days: 44, practiceDays: 27, cycles: 6, qualifiedLessons: 5, qualifiedImprovements: 4, completedPieces: 12 }, 4: { days: 53, practiceDays: 33, cycles: 8, qualifiedLessons: 6, qualifiedImprovements: 5, completedPieces: 15 } }))
  it('provides deterministic repeated 120% ceiling scaling', () => expect([scaleTarget(30), scaleTarget(scaleTarget(30)), scaleTarget(scaleTarget(scaleTarget(30)))]).toEqual([36, 44, 53]))
  it.each([1, 2, 3, 4] as const)('unlocks Stage %s exactly when all six targets pass', (stage) => { const input = completeInput(stage); const result = evaluateStageProgression(input); expect(result.requirements).toHaveLength(6); expect(result.eligibleForNextStage).toBe(true); expect(result.nextStage).toBe(stage + 1); const snapshot = createStageEntrySnapshot(result, input, [], `s${stage}`); expect(snapshot?.newStage).toBe(stage + 1); expect(createStageEntrySnapshot(result, input, [snapshot!], 'again')).toBeNull() })
  it('uses only evidence in the current Stage window', () => { const input = completeInput(2, '2026-03-01'); input.practiceRecords.push({ id: 'old', date: '2026-02-28', minutes: 10, quality: 'focused' }); expect(evaluateStageProgression(input).requirements.find((item) => item.id === 'practice-days')?.actual).toBe(STAGE_TARGETS[2].practiceDays) })
  it('excludes distinct Urlaub dates from elapsed days', () => { const input = completeInput(1); input.vacationPeriods = [{ id: 'v', childId: 'child', startDate: '2026-01-10', endDate: '2026-01-14', createdAt: '2026-01-01' }]; expect(evaluateStageProgression(input).requirements.find((item) => item.id === 'elapsed-days')?.actual).toBe(25) })
  it('does not add Root or any legacy category as a Stage requirement', () => expect(evaluateStageProgression(completeInput(1)).requirements.map((item) => item.id)).toEqual(['elapsed-days', 'practice-days', 'learning-cycles', 'qualified-lessons', 'qualified-improvements', 'completed-pieces']))
})
