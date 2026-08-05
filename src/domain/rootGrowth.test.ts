import { describe, expect, it } from 'vitest'
import { calculateLessonRootAward, totalRootAwardPoints } from './rootGrowth'

describe('per-lesson permanent Root growth', () => {
  it('awards one point for each cycle, piece, and big-improvement category', () => {
    expect(calculateLessonRootAward({ lessonEvaluationId: 'cycle', completedCycle: true, newlyCompletedPieceCount: 0, improvements: ['small'], createdAt: 'now' }).points).toBe(1)
    expect(calculateLessonRootAward({ lessonEvaluationId: 'piece', completedCycle: false, newlyCompletedPieceCount: 3, improvements: ['small'], createdAt: 'now' }).points).toBe(1)
    expect(calculateLessonRootAward({ lessonEvaluationId: 'big', completedCycle: false, newlyCompletedPieceCount: 0, improvements: ['big', 'big'], createdAt: 'now' }).points).toBe(1)
  })
  it('caps a LessonEvaluation at three Root points', () => expect(calculateLessonRootAward({ lessonEvaluationId: 'all', completedCycle: true, newlyCompletedPieceCount: 4, improvements: ['big'], createdAt: 'now' }).points).toBe(3))
  it('deduplicates replayed awards by stable LessonEvaluation ID', () => {
    const award = calculateLessonRootAward({ lessonEvaluationId: 'stable', completedCycle: true, newlyCompletedPieceCount: 1, improvements: ['big'], createdAt: 'now' })
    expect(totalRootAwardPoints([award, { ...award }])).toBe(3)
  })
})
