import type { HomeworkItemEvaluation, HomeworkItemImprovementLevel } from './types'
import { effectiveElapsedDays, type VacationPeriod } from './vacation'

export type ProgressionStage = 1 | 2 | 3 | 4 | 5
export type ParentPracticeQuality = 'difficult' | 'normal' | 'focused'

export type ProgressionPracticeRecord = { id: string; date: string; minutes: number; quality?: ParentPracticeQuality; valid?: boolean; saved?: boolean; achievements?: string[] }
export type ProgressionLearningCycle = { id: string; childId: string; startedAt: string; completedAt: string; homeworkItemIds: string[]; practiceRecordIds: string[]; teacherLessonEvaluationId: string; completedHomeworkItemIds: string[]; unfinishedHomeworkItemIds: string[]; status: 'completed' }
export type ProgressionLessonEvaluation = { id: string; lessonDate: string; itemEvaluations: HomeworkItemEvaluation[] }
export type StageProgressionInput = { currentStage: 1 | 2 | 3 | 4; stageEntryDate: string; currentDate: string; practiceRecords: ProgressionPracticeRecord[]; learningCycles: ProgressionLearningCycle[]; lessonEvaluations: ProgressionLessonEvaluation[]; completedPieces: Array<{ id: string; completionDate: string }>; concertRecords: Array<{ id: string; date: string }>; vacationPeriods?: VacationPeriod[] }
export type StageRequirement = { id: string; label: string; required: number; actual: number; progress: number; completed: boolean }
export type MilestoneProgress = { concert: number; perfectEvaluations: number; majorBreakthrough: number; progress: number; completed: boolean }
export type ConfiguredStageProgression = { status: 'configured'; currentStage: 1 | 2 | 3 | 4; nextStage: 2 | 3 | 4 | 5; eligibleForNextStage: boolean; requirements: StageRequirement[]; milestone?: MilestoneProgress; qualifyingEventIds: string[] }
export type StageProgressionResult = ConfiguredStageProgression

export type StageTargets = { days: number; practiceDays: number; cycles: number; qualifiedLessons: number; qualifiedImprovements: number; completedPieces: number }
export const STAGE_TARGETS: Record<1 | 2 | 3 | 4, StageTargets> = {
  1: { days: 30, practiceDays: 18, cycles: 4, qualifiedLessons: 3, qualifiedImprovements: 2, completedPieces: 8 },
  2: { days: 36, practiceDays: 22, cycles: 5, qualifiedLessons: 4, qualifiedImprovements: 3, completedPieces: 10 },
  3: { days: 44, practiceDays: 27, cycles: 6, qualifiedLessons: 5, qualifiedImprovements: 4, completedPieces: 12 },
  4: { days: 53, practiceDays: 33, cycles: 8, qualifiedLessons: 6, qualifiedImprovements: 5, completedPieces: 15 },
}
export const scaleTarget = (previousTarget: number) => Math.ceil(previousTarget * 1.2)

export const PRACTICE_QUALITY_WEIGHTS: Record<ParentPracticeQuality, number> = { difficult: 0.3, normal: 0.7, focused: 1 }
const improvementRank: Record<HomeworkItemImprovementLevel, number> = { none: 0, small: 1, clear: 2, big: 3 }
const inPeriod = (value: string, start: string, end: string) => value.slice(0, 10) >= start.slice(0, 10) && value.slice(0, 10) <= end.slice(0, 10)
const requirement = (id: string, label: string, actual: number, required: number): StageRequirement => ({ id, label, actual, required, progress: Math.min(actual / required, 1), completed: actual >= required })

export const lessonQuality = (evaluation: ProgressionLessonEvaluation) => evaluation.itemEvaluations.length ? evaluation.itemEvaluations.reduce((sum, item) => sum + item.score, 0) / evaluation.itemEvaluations.length : 0
export const lessonImprovement = (evaluation: ProgressionLessonEvaluation) => evaluation.itemEvaluations.reduce<HomeworkItemImprovementLevel>((best, item) => improvementRank[item.improvement] > improvementRank[best] ? item.improvement : best, 'none')
export const isQualifiedLesson = (evaluation: ProgressionLessonEvaluation) => lessonQuality(evaluation) > 40
export const hasQualifiedImprovement = (evaluation: ProgressionLessonEvaluation) => improvementRank[lessonImprovement(evaluation)] >= improvementRank.clear

export const selectValidPracticeDays = (records: ProgressionPracticeRecord[]) => {
  const recordsByDate = new Map<string, ProgressionPracticeRecord>()
  records.filter((record) => record.minutes >= 5 && Boolean(record.quality) && record.valid !== false && record.saved !== false).forEach((record) => {
    const existing = recordsByDate.get(record.date)
    if (!existing || PRACTICE_QUALITY_WEIGHTS[record.quality!] > PRACTICE_QUALITY_WEIGHTS[existing.quality!] || (PRACTICE_QUALITY_WEIGHTS[record.quality!] === PRACTICE_QUALITY_WEIGHTS[existing.quality!] && record.id.localeCompare(existing.id) < 0)) recordsByDate.set(record.date, record)
  })
  return [...recordsByDate.values()].sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id))
}

// Retained for Health/reporting callers; it is deliberately not a Stage requirement.
export const practiceQualityScore = (records: ProgressionPracticeRecord[]) => {
  const days = selectValidPracticeDays(records)
  return days.length ? Number((days.reduce((sum, record) => sum + PRACTICE_QUALITY_WEIGHTS[record.quality!], 0) / days.length).toFixed(10)) : 0
}

export const isCompletedLearningCycle = (cycle: ProgressionLearningCycle, practices: ProgressionPracticeRecord[], lesson?: ProgressionLessonEvaluation) => {
  if (cycle.status !== 'completed' || cycle.homeworkItemIds.length === 0 || !lesson || lesson.id !== cycle.teacherLessonEvaluationId) return false
  const validPracticeIds = new Set(practices.filter((record) => record.minutes >= 5 && Boolean(record.quality) && record.valid !== false && record.saved !== false).map((record) => record.id))
  if (!cycle.practiceRecordIds.some((id) => validPracticeIds.has(id))) return false
  const evaluatedIds = new Set(lesson.itemEvaluations.map((item) => item.homeworkItemId))
  const resolvedIds = new Set([...cycle.completedHomeworkItemIds, ...cycle.unfinishedHomeworkItemIds])
  return cycle.homeworkItemIds.every((id) => evaluatedIds.has(id) && resolvedIds.has(id))
}

export const evaluateStageProgression = (input: StageProgressionInput): StageProgressionResult => {
  const targets = STAGE_TARGETS[input.currentStage]
  const periodPractices = input.practiceRecords.filter((record) => inPeriod(record.date, input.stageEntryDate, input.currentDate))
  const validPractices = selectValidPracticeDays(periodPractices)
  const lessons = input.lessonEvaluations.filter((lesson) => inPeriod(lesson.lessonDate, input.stageEntryDate, input.currentDate) && lesson.itemEvaluations.length > 0)
  const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]))
  const cyclesByLesson = new Map<string, ProgressionLearningCycle>()
  input.learningCycles.filter((cycle) => inPeriod(cycle.completedAt, input.stageEntryDate, input.currentDate) && isCompletedLearningCycle(cycle, periodPractices, lessonsById.get(cycle.teacherLessonEvaluationId))).forEach((cycle) => {
    if (!cyclesByLesson.has(cycle.teacherLessonEvaluationId)) cyclesByLesson.set(cycle.teacherLessonEvaluationId, cycle)
  })
  const qualifiedLessons = lessons.filter(isQualifiedLesson)
  const qualifiedImprovements = lessons.filter(hasQualifiedImprovement)
  const pieces = input.completedPieces.filter((piece) => inPeriod(piece.completionDate, input.stageEntryDate, input.currentDate))
  const requirements = [
    requirement('elapsed-days', 'Days', effectiveElapsedDays(input.stageEntryDate, input.currentDate, input.vacationPeriods ?? []), targets.days),
    requirement('practice-days', 'Valid practice days', validPractices.length, targets.practiceDays),
    requirement('learning-cycles', 'Learning cycles', cyclesByLesson.size, targets.cycles),
    requirement('qualified-lessons', 'Qualified lessons', qualifiedLessons.length, targets.qualifiedLessons),
    requirement('qualified-improvements', 'Qualified improvements', qualifiedImprovements.length, targets.qualifiedImprovements),
    requirement('completed-pieces', 'Completed pieces', pieces.length, targets.completedPieces),
  ]
  const eligibleForNextStage = requirements.every((item) => item.completed)
  return { status: 'configured', currentStage: input.currentStage, nextStage: (input.currentStage + 1) as 2 | 3 | 4 | 5, eligibleForNextStage, requirements, qualifyingEventIds: [...new Set([...cyclesByLesson.values()].map((cycle) => cycle.id).concat(qualifiedLessons.map((lesson) => lesson.id), qualifiedImprovements.map((lesson) => lesson.id), pieces.map((piece) => piece.id)))] }
}

export type StageEntrySnapshot = { id: string; previousStage: 1 | 2 | 3 | 4; newStage: 2 | 3 | 4 | 5; stageEntryDate: string; qualifyingEventIds: string[]; cumulativeTotals: { practiceDays: number; learningCycles: number; completedPieces: number }; stageCounters: Record<string, 0>; permanentStage: number }
export const createStageEntrySnapshot = (result: StageProgressionResult, input: StageProgressionInput, existing: StageEntrySnapshot[], id: string): StageEntrySnapshot | null => {
  if (!result.eligibleForNextStage || existing.some((entry) => entry.previousStage === result.currentStage && entry.newStage === result.nextStage)) return null
  return { id, previousStage: result.currentStage, newStage: result.nextStage, stageEntryDate: input.currentDate, qualifyingEventIds: result.qualifyingEventIds, cumulativeTotals: { practiceDays: selectValidPracticeDays(input.practiceRecords).length, learningCycles: input.learningCycles.length, completedPieces: input.completedPieces.length }, stageCounters: { practiceDays: 0, learningCycles: 0, completedPieces: 0 }, permanentStage: result.nextStage }
}
