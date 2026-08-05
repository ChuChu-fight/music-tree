import { describe, expect, it } from 'vitest'
import { evaluateSpecialFruitUnlocks, defaultRewards } from './specialFruitEngine'
import type { PracticeRecord, TeacherEvaluation } from './types'

const rewardProgressBase = {
  childId: 'child_001',
  rewardPracticeDates: [],
  rewardCompletedPieceIds: [],
  rewardHighestTeacherEvaluationIds: [],
  updatedAt: '2026-08-01',
}

const makePractice = (date: string, minutes = 15): PracticeRecord => ({
  id: `practice_${date}`,
  childId: 'child_001',
  date,
  minutes,
  quality: 'focused',
  achievements: ['assigned_section'],
  customAchievement: '',
  improvement: 'small',
  parentNote: '',
  createdAt: `${date}T12:00:00.000Z`,
  updatedAt: `${date}T12:00:00.000Z`,
})

describe('special fruit engine', () => {
  it('creates one fruit for six valid practice days and two completed pieces', () => {
    const records = [
      makePractice('2026-08-01'),
      makePractice('2026-08-02'),
      makePractice('2026-08-03'),
      makePractice('2026-08-04'),
      makePractice('2026-08-05'),
      makePractice('2026-08-06'),
    ]
    const completedPieces = [
      { id: 'piece_1', pieceName: 'Little Star', completionDate: '2026-08-02', confirmedBy: 'teacher' as const, note: '' },
      { id: 'piece_2', pieceName: 'Moonlight', completionDate: '2026-08-05', confirmedBy: 'parent' as const, note: '' },
    ]

    const result = evaluateSpecialFruitUnlocks({
      practiceRecords: records,
      completedPieces,
      teacherEvaluations: [],
      concerts: [],
      rewards: defaultRewards,
      existingFruits: [],
      progress: rewardProgressBase,
    })

    expect(result.fruitsCreated.length).toBe(1)
    expect(result.fruitsCreated[0].unlockReason).toBe('practice_and_pieces')
    expect(result.progress.rewardPracticeDates).toEqual([])
    expect(result.progress.rewardCompletedPieceIds).toEqual([])
  })

  it('creates one fruit for two score-5 teacher evaluations', () => {
    const evaluations: TeacherEvaluation[] = [
      { id: 'eval_1', childId: 'child_001', homeworkId: 'h1', score: 5, improvement: 'clear', teacherComment: 'Great', completedPiece: false, completedPieceName: '', createdAt: '2026-08-02' },
      { id: 'eval_2', childId: 'child_001', homeworkId: 'h2', score: 5, improvement: 'breakthrough', teacherComment: 'Fantastic', completedPiece: false, completedPieceName: '', createdAt: '2026-08-06' },
    ]

    const result = evaluateSpecialFruitUnlocks({
      practiceRecords: [],
      completedPieces: [],
      teacherEvaluations: evaluations,
      concerts: [],
      rewards: defaultRewards,
      existingFruits: [],
      progress: rewardProgressBase,
    })

    expect(result.fruitsCreated.length).toBe(1)
    expect(result.fruitsCreated[0].unlockReason).toBe('two_highest_teacher_scores')
    expect(result.progress.rewardHighestTeacherEvaluationIds).toEqual([])
  })

  it('creates one fruit for a recorded concert', () => {
    const concerts = [{ id: 'concert_1', childId: 'child_001', name: 'Spring Concert', date: '2026-08-12', pieceName: 'Little Star', note: '', createdAt: '2026-08-12' }]

    const result = evaluateSpecialFruitUnlocks({
      practiceRecords: [],
      completedPieces: [],
      teacherEvaluations: [],
      concerts,
      rewards: defaultRewards,
      existingFruits: [],
      progress: rewardProgressBase,
    })

    expect(result.fruitsCreated.length).toBe(1)
    expect(result.fruitsCreated[0].unlockReason).toBe('concert_performance')
  })

  it('does not duplicate fruits when the same condition is processed twice', () => {
    const records = Array.from({ length: 7 }, (_, index) => makePractice(`2026-08-${String(index + 1).padStart(2, '0')}`))
    const completedPieces = [
      { id: 'piece_1', pieceName: 'Little Star', completionDate: '2026-08-02', confirmedBy: 'teacher' as const, note: '' },
      { id: 'piece_2', pieceName: 'Moonlight', completionDate: '2026-08-05', confirmedBy: 'parent' as const, note: '' },
    ]

    const first = evaluateSpecialFruitUnlocks({
      practiceRecords: records,
      completedPieces,
      teacherEvaluations: [],
      concerts: [],
      rewards: defaultRewards,
      existingFruits: [],
      progress: rewardProgressBase,
    })

    const second = evaluateSpecialFruitUnlocks({
      practiceRecords: records,
      completedPieces,
      teacherEvaluations: [],
      concerts: [],
      rewards: defaultRewards,
      existingFruits: first.fruitsCreated,
      progress: first.progress,
    })

    expect(second.fruitsCreated).toEqual([])
  })
})
