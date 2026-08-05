import { calculateStageProgress } from './childStageProgress'
import { createInitialTreeState } from './treeGrowthEngine'
import { deriveInactivityTreeState } from './treeInactivity'
import { createStageEntrySnapshot, evaluateStageProgression, lessonImprovement, lessonQuality, practiceQualityScore, selectValidPracticeDays, type ProgressionLessonEvaluation, type ProgressionPracticeRecord, type StageProgressionInput } from './stageProgressionEngine'

export type DevelopmentScenarioName =
  | 'new_child' | 'stage_1_halfway' | 'stage_1_missing_one_requirement' | 'stage_1_complete'
  | 'stage_2_missing_one_requirement' | 'stage_2_complete' | 'stage_3_concert_route'
  | 'stage_3_perfect_lessons_route' | 'stage_3_big_breakthrough_route' | 'invalid_practice_records'
  | 'incomplete_learning_cycle' | 'completed_piece_and_fruit' | 'inactivity_4_to_6_days'
  | 'inactivity_7_plus_days' | 'stage_4_to_5_not_configured'

export type DevelopmentScenarioResult = {
  scenario: DevelopmentScenarioName
  expectedStage: number
  actualStage: number
  expectedEligibility: boolean | 'NOT_CONFIGURED'
  actualEligibility: boolean | 'NOT_CONFIGURED'
  progress: number | 'NOT_CONFIGURED'
  validPracticeDays: number
  qualityScore: number
  completedCycles: number
  completedPieces: number
  fruitCount: number
  lessonCounts: { total: number; at60: number; at80: number; perfect: number }
  milestoneRoute: 'none' | 'concert' | 'perfect_lessons' | 'big_breakthrough'
  snapshotCreatedOnce: boolean
  passed: boolean
}

const dates = (start: string, count: number) => {
  const first = new Date(`${start}T00:00:00Z`).getTime()
  return Array.from({ length: count }, (_, index) => new Date(first + index * 86_400_000).toISOString().slice(0, 10))
}

const practices = (start: string, count: number, effort = false): ProgressionPracticeRecord[] => dates(start, count).map((date, index) => ({ id: `practice_${start}_${String(index + 1).padStart(2, '0')}`, date, minutes: 15, quality: 'focused', valid: true, saved: true, achievements: effort && index < 5 ? ['continued_after_difficulty'] : [] }))
const lessons = (start: string, count: number, score: 20 | 40 | 60 | 80 | 100 = 80, improvement: 'small' | 'clear' | 'big' = 'clear'): ProgressionLessonEvaluation[] => dates(start, count).map((lessonDate, index) => ({ id: `lesson_${start}_${index + 1}`, lessonDate, itemEvaluations: [{ homeworkItemId: `homework_${start}_${index + 1}`, score, improvement, completed: true }] }))
const cycles = (start: string, evaluations: ProgressionLessonEvaluation[], practiceRecords: ProgressionPracticeRecord[]) => evaluations.map((evaluation, index) => ({ id: `cycle_${start}_${index + 1}`, childId: 'scenario_child', startedAt: start, completedAt: evaluation.lessonDate, homeworkItemIds: [evaluation.itemEvaluations[0].homeworkItemId], practiceRecordIds: [practiceRecords[index].id], teacherLessonEvaluationId: evaluation.id, completedHomeworkItemIds: [evaluation.itemEvaluations[0].homeworkItemId], unfinishedHomeworkItemIds: [], status: 'completed' as const }))

const emptyInput = (): StageProgressionInput => ({ currentStage: 1, stageEntryDate: '2026-01-01', currentDate: '2026-01-01', practiceRecords: [], learningCycles: [], lessonEvaluations: [], completedPieces: [], concertRecords: [] })
const stageOneComplete = (): StageProgressionInput => { const practiceRecords = practices('2026-01-02', 18); const lessonEvaluations = lessons('2026-01-06', 4, 80, 'small'); return { currentStage: 1, stageEntryDate: '2026-01-01', currentDate: '2026-01-31', practiceRecords, learningCycles: cycles('2026-01-01', lessonEvaluations, practiceRecords), lessonEvaluations, completedPieces: [{ id: 'piece_stage1_1', completionDate: '2026-01-25' }], concertRecords: [] } }
const stageTwoComplete = (): StageProgressionInput => { const practiceRecords = practices('2026-02-02', 25); const lessonEvaluations = lessons('2026-02-07', 6); return { currentStage: 2, stageEntryDate: '2026-02-01', currentDate: '2026-03-18', practiceRecords, learningCycles: cycles('2026-02-01', lessonEvaluations, practiceRecords), lessonEvaluations, completedPieces: [{ id: 'piece_stage2_1', completionDate: '2026-02-20' }, { id: 'piece_stage2_2', completionDate: '2026-03-10' }], concertRecords: [] } }
const stageThreeComplete = (): StageProgressionInput => { const practiceRecords = practices('2026-04-02', 35, true); const lessonEvaluations = lessons('2026-04-08', 8); return { currentStage: 3, stageEntryDate: '2026-04-01', currentDate: '2026-05-31', practiceRecords, learningCycles: cycles('2026-04-01', lessonEvaluations, practiceRecords), lessonEvaluations, completedPieces: [{ id: 'piece_stage3_1', completionDate: '2026-04-20' }, { id: 'piece_stage3_2', completionDate: '2026-05-01' }, { id: 'piece_stage3_3', completionDate: '2026-05-20' }], concertRecords: [] } }

const summarize = (scenario: DevelopmentScenarioName, input: StageProgressionInput, expectedStage: number, expectedEligibility: boolean | 'NOT_CONFIGURED', fruitCount = 0, expectedRoute: DevelopmentScenarioResult['milestoneRoute'] = 'none'): DevelopmentScenarioResult => {
  const result = evaluateStageProgression(input)
  const snapshot = createStageEntrySnapshot(result, input, [], `snapshot_${scenario}`)
  const duplicateSnapshot = snapshot ? createStageEntrySnapshot(result, input, [snapshot], `duplicate_${scenario}`) : null
  const actualStage = snapshot?.newStage ?? input.currentStage
  const actualEligibility = result.eligibleForNextStage
  const progressResult = calculateStageProgress(input)
  const validDays = selectValidPracticeDays(input.practiceRecords.filter((record) => record.date >= input.stageEntryDate && record.date <= input.currentDate))
  const cycleRequirement = result.requirements.find((item) => item.id === 'learning-cycles')?.actual ?? 0
  const qualities = input.lessonEvaluations.filter((lesson) => lesson.itemEvaluations.length).map((lesson) => ({ quality: lessonQuality(lesson), improvement: lessonImprovement(lesson) }))
  const route = input.concertRecords.length ? 'concert' : qualities.filter((item) => item.quality === 100).length >= 2 ? 'perfect_lessons' : qualities.some((item) => item.improvement === 'big') ? 'big_breakthrough' : 'none'
  const snapshotCreatedOnce = expectedEligibility === true ? Boolean(snapshot) && duplicateSnapshot === null : snapshot === null
  const summary: DevelopmentScenarioResult = { scenario, expectedStage, actualStage, expectedEligibility, actualEligibility, progress: progressResult.percentage ?? 'NOT_CONFIGURED', validPracticeDays: validDays.length, qualityScore: practiceQualityScore(validDays), completedCycles: cycleRequirement, completedPieces: input.completedPieces.length, fruitCount, lessonCounts: { total: qualities.length, at60: qualities.filter((item) => item.quality >= 60).length, at80: qualities.filter((item) => item.quality >= 80).length, perfect: qualities.filter((item) => item.quality === 100).length }, milestoneRoute: route, snapshotCreatedOnce, passed: false }
  summary.passed = actualStage === expectedStage && actualEligibility === expectedEligibility && route === expectedRoute && snapshotCreatedOnce
  return summary
}

export const buildDevelopmentScenarioResults = (): DevelopmentScenarioResult[] => {
  const newChild = emptyInput()
  const halfway = { ...stageOneComplete(), currentDate: '2026-01-16', practiceRecords: practices('2026-01-02', 9), learningCycles: [], lessonEvaluations: [], completedPieces: [] }
  const missingOne = { ...stageOneComplete(), completedPieces: [] }
  const stageTwoMissing = { ...stageTwoComplete(), completedPieces: [{ id: 'only_piece', completionDate: '2026-03-01' }] }
  const concert = stageThreeComplete(); concert.concertRecords = [{ id: 'concert_route', date: '2026-05-20' }]
  const perfect = stageThreeComplete(); perfect.lessonEvaluations = perfect.lessonEvaluations.map((lesson, index) => index < 2 ? { ...lesson, itemEvaluations: lesson.itemEvaluations.map((item) => ({ ...item, score: 100 })) } : lesson)
  const breakthrough = stageThreeComplete(); breakthrough.lessonEvaluations[0].itemEvaluations[0].improvement = 'big'
  const invalid = emptyInput(); invalid.currentDate = '2026-01-10'; invalid.practiceRecords = [{ id: 'short', date: '2026-01-02', minutes: 4, quality: 'focused' }, { id: 'missing_quality', date: '2026-01-03', minutes: 10 }, { id: 'duplicate_difficult', date: '2026-01-04', minutes: 10, quality: 'difficult' }, { id: 'duplicate_focused', date: '2026-01-04', minutes: 10, quality: 'focused' }]
  const incompleteCycle = stageOneComplete(); incompleteCycle.learningCycles = [{ ...incompleteCycle.learningCycles[0], practiceRecordIds: ['missing_practice'] }]
  const stageFour = { ...stageThreeComplete(), currentStage: 4 as const }
  const baseTree = { ...createInitialTreeState(), lastPracticeDate: '2026-06-01', leafCount: 20, glowLevel: 4, stage: 3, fruitCount: 2, completedPieces: ['piece_memory'] }
  const quiet = deriveInactivityTreeState(baseTree, '2026-06-06')
  const nibbling = deriveInactivityTreeState(baseTree, '2026-06-10')

  return [
    summarize('new_child', newChild, 1, false),
    summarize('stage_1_halfway', halfway, 1, false),
    summarize('stage_1_missing_one_requirement', missingOne, 1, false),
    summarize('stage_1_complete', stageOneComplete(), 2, true),
    summarize('stage_2_missing_one_requirement', stageTwoMissing, 2, false),
    summarize('stage_2_complete', stageTwoComplete(), 3, true),
    summarize('stage_3_concert_route', concert, 4, true, 0, 'concert'),
    summarize('stage_3_perfect_lessons_route', perfect, 4, true, 0, 'perfect_lessons'),
    summarize('stage_3_big_breakthrough_route', breakthrough, 4, true, 0, 'big_breakthrough'),
    summarize('invalid_practice_records', invalid, 1, false),
    summarize('incomplete_learning_cycle', incompleteCycle, 1, false),
    summarize('completed_piece_and_fruit', { ...newChild, completedPieces: [{ id: 'completed_piece_homework_piece', completionDate: '2026-01-01' }] }, 1, false, 1),
    { ...summarize('inactivity_4_to_6_days', newChild, 1, false), fruitCount: quiet.fruitCount, passed: quiet.creatureState === 'watching' && quiet.leafCount === baseTree.leafCount && quiet.stage === baseTree.stage },
    { ...summarize('inactivity_7_plus_days', newChild, 1, false), fruitCount: nibbling.fruitCount, passed: nibbling.creatureState === 'nibbling' && nibbling.leafCount < baseTree.leafCount && nibbling.glowLevel < baseTree.glowLevel && nibbling.stage === baseTree.stage && nibbling.fruitCount === baseTree.fruitCount && nibbling.completedPieces === baseTree.completedPieces },
    summarize('stage_4_to_5_not_configured', stageFour, 4, 'NOT_CONFIGURED'),
  ]
}
