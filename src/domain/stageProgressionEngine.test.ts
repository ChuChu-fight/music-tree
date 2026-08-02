import { describe, expect, it } from 'vitest'
import { evaluateStageProgression } from './stageProgressionEngine'

describe('stage progression engine', () => {
  it('fewer than 30 elapsed days cannot unlock Stage 2', () => {
    const result = evaluateStageProgression({
      currentStage: 1,
      stageEntryDate: '2026-07-01',
      currentDate: '2026-07-20',
      validPracticeDates: ['2026-07-02', '2026-07-04', '2026-07-05', '2026-07-07', '2026-07-09'],
      qualityByDate: { '2026-07-02': 'focused', '2026-07-04': 'normal', '2026-07-05': 'focused', '2026-07-07': 'normal', '2026-07-09': 'focused' },
      teacherEvaluations: [
        { id: 'e1', createdAt: '2026-07-05', score: 3, improvement: 'clear' },
        { id: 'e2', createdAt: '2026-07-12', score: 4, improvement: 'small' },
      ],
      learningCycles: [
        { id: 'c1', childId: 'child_001', homeworkId: 'h1', startedAt: '2026-07-01', validPracticeDates: ['2026-07-02', '2026-07-04'], teacherEvaluationId: 'e1', completedPieceIds: ['p1'], status: 'completed' },
        { id: 'c2', childId: 'child_001', homeworkId: 'h2', startedAt: '2026-07-06', validPracticeDates: ['2026-07-07', '2026-07-09'], teacherEvaluationId: 'e2', completedPieceIds: [], status: 'completed' },
      ],
      completedPieces: [{ id: 'p1', pieceName: 'Moonlight', completionDate: '2026-07-10', confirmedBy: 'teacher' }],
      reviewHistory: [],
    })

    expect(result.eligibleForNextStage).toBe(false)
    expect(result.nextStage).toBe(2)
  })

  it('30 elapsed days without enough practice cannot unlock Stage 2', () => {
    const result = evaluateStageProgression({
      currentStage: 1,
      stageEntryDate: '2026-07-01',
      currentDate: '2026-07-31',
      validPracticeDates: ['2026-07-02', '2026-07-07', '2026-07-14', '2026-07-20'],
      qualityByDate: { '2026-07-02': 'focused', '2026-07-07': 'normal', '2026-07-14': 'focused', '2026-07-20': 'normal' },
      teacherEvaluations: [
        { id: 'e1', createdAt: '2026-07-08', score: 3, improvement: 'small' },
        { id: 'e2', createdAt: '2026-07-18', score: 3, improvement: 'clear' },
      ],
      learningCycles: [
        { id: 'c1', childId: 'child_001', homeworkId: 'h1', startedAt: '2026-07-01', validPracticeDates: ['2026-07-02'], teacherEvaluationId: 'e1', completedPieceIds: [], status: 'completed' },
        { id: 'c2', childId: 'child_001', homeworkId: 'h2', startedAt: '2026-07-10', validPracticeDates: ['2026-07-14'], teacherEvaluationId: 'e2', completedPieceIds: [], status: 'completed' },
      ],
      completedPieces: [{ id: 'p1', pieceName: 'Moonlight', completionDate: '2026-07-24', confirmedBy: 'teacher' }],
      reviewHistory: [],
    })

    expect(result.eligibleForNextStage).toBe(false)
  })

  it('many minutes on few dates cannot replace distinct practice days', () => {
    const result = evaluateStageProgression({
      currentStage: 1,
      stageEntryDate: '2026-07-01',
      currentDate: '2026-08-06',
      validPracticeDates: ['2026-07-03', '2026-07-10', '2026-07-17'],
      qualityByDate: { '2026-07-03': 'focused', '2026-07-10': 'focused', '2026-07-17': 'focused' },
      teacherEvaluations: [
        { id: 'e1', createdAt: '2026-07-12', score: 3, improvement: 'small' },
        { id: 'e2', createdAt: '2026-07-28', score: 4, improvement: 'small' },
      ],
      learningCycles: [
        { id: 'c1', childId: 'child_001', homeworkId: 'h1', startedAt: '2026-07-03', validPracticeDates: ['2026-07-03'], teacherEvaluationId: 'e1', completedPieceIds: ['p1'], status: 'completed' },
        { id: 'c2', childId: 'child_001', homeworkId: 'h2', startedAt: '2026-07-17', validPracticeDates: ['2026-07-17'], teacherEvaluationId: 'e2', completedPieceIds: ['p2'], status: 'completed' },
      ],
      completedPieces: [
        { id: 'p1', pieceName: 'Moonlight', completionDate: '2026-07-10', confirmedBy: 'teacher' },
        { id: 'p2', pieceName: 'Little Star', completionDate: '2026-07-22', confirmedBy: 'teacher' },
      ],
      reviewHistory: [],
    })

    expect(result.requirements.find((item) => item.id === 'practice-days')?.completed).toBe(false)
  })

  it('one concert cannot skip stages', () => {
    const result = evaluateStageProgression({
      currentStage: 1,
      stageEntryDate: '2026-07-01',
      currentDate: '2026-08-31',
      validPracticeDates: ['2026-07-02', '2026-07-04', '2026-07-06', '2026-07-08', '2026-07-10', '2026-07-12'],
      qualityByDate: { '2026-07-02': 'focused', '2026-07-04': 'focused', '2026-07-06': 'focused', '2026-07-08': 'focused', '2026-07-10': 'focused', '2026-07-12': 'focused' },
      teacherEvaluations: [
        { id: 'e1', createdAt: '2026-07-15', score: 5, improvement: 'major' },
      ],
      learningCycles: [
        { id: 'c1', childId: 'child_001', homeworkId: 'h1', startedAt: '2026-07-01', validPracticeDates: ['2026-07-02'], teacherEvaluationId: 'e1', completedPieceIds: ['p1'], status: 'completed' },
      ],
      completedPieces: [{ id: 'p1', pieceName: 'Moonlight', completionDate: '2026-07-18', confirmedBy: 'teacher' }],
      concertRecords: [{ id: 'concert_1', childId: 'child_001', name: 'Spring Concert', date: '2026-08-20', pieceName: 'Little Star', note: 'Nice' }],
      reviewHistory: [],
    })

    expect(result.eligibleForNextStage).toBe(false)
  })

  it('difficult practice days still count as effort', () => {
    const result = evaluateStageProgression({
      currentStage: 1,
      stageEntryDate: '2026-07-01',
      currentDate: '2026-08-30',
      validPracticeDates: Array.from({ length: 18 }, (_, index) => `2026-07-${String(index + 2).padStart(2, '0')}`),
      qualityByDate: Object.fromEntries(Array.from({ length: 18 }, (_, index) => [`2026-07-${String(index + 2).padStart(2, '0')}`, index % 3 === 0 ? 'difficult' : index % 3 === 1 ? 'normal' : 'focused'])),
      teacherEvaluations: [
        { id: 'e1', createdAt: '2026-07-15', score: 3, improvement: 'small' },
        { id: 'e2', createdAt: '2026-07-25', score: 4, improvement: 'clear' },
        { id: 'e3', createdAt: '2026-08-05', score: 5, improvement: 'major' },
      ],
      learningCycles: [
        { id: 'c1', childId: 'child_001', homeworkId: 'h1', startedAt: '2026-07-01', validPracticeDates: ['2026-07-04'], teacherEvaluationId: 'e1', completedPieceIds: ['p1'], status: 'completed' },
        { id: 'c2', childId: 'child_001', homeworkId: 'h2', startedAt: '2026-07-18', validPracticeDates: ['2026-07-20'], teacherEvaluationId: 'e2', completedPieceIds: ['p2'], status: 'completed' },
        { id: 'c3', childId: 'child_001', homeworkId: 'h3', startedAt: '2026-07-28', validPracticeDates: ['2026-07-30'], teacherEvaluationId: 'e3', completedPieceIds: ['p3'], status: 'completed' },
      ],
      completedPieces: [
        { id: 'p1', pieceName: 'Moonlight', completionDate: '2026-07-10', confirmedBy: 'teacher' },
        { id: 'p2', pieceName: 'Little Star', completionDate: '2026-07-22', confirmedBy: 'teacher' },
        { id: 'p3', pieceName: 'Winter Waltz', completionDate: '2026-08-15', confirmedBy: 'teacher' },
      ],
      reviewHistory: [],
    })

    expect(result.requirements.find((item) => item.id === 'quality-ratio')?.completed).toBe(true)
  })

  it('Stage 2 counters begin when Stage 2 is entered', () => {
    const result = evaluateStageProgression({
      currentStage: 2,
      stageEntryDate: '2026-08-10',
      currentDate: '2026-09-20',
      validPracticeDates: ['2026-08-12', '2026-08-13', '2026-08-14', '2026-08-16', '2026-08-17'],
      qualityByDate: { '2026-08-12': 'focused', '2026-08-13': 'normal', '2026-08-14': 'focused', '2026-08-16': 'normal', '2026-08-17': 'focused' },
      teacherEvaluations: [
        { id: 'e1', createdAt: '2026-08-12', score: 3, improvement: 'clear' },
        { id: 'e2', createdAt: '2026-08-20', score: 4, improvement: 'clear' },
      ],
      learningCycles: [
        { id: 'c1', childId: 'child_001', homeworkId: 'h1', startedAt: '2026-08-10', validPracticeDates: ['2026-08-12'], teacherEvaluationId: 'e1', completedPieceIds: [], status: 'completed' },
        { id: 'c2', childId: 'child_001', homeworkId: 'h2', startedAt: '2026-08-16', validPracticeDates: ['2026-08-17'], teacherEvaluationId: 'e2', completedPieceIds: [], status: 'completed' },
      ],
      completedPieces: [{ id: 'p1', pieceName: 'Little Star', completionDate: '2026-08-18', confirmedBy: 'teacher' }],
      reviewHistory: [],
    })

    expect(result.requirements.find((item) => item.id === 'elapsed-days')?.completed).toBe(false)
  })
})
