import { describe, expect, it } from 'vitest'
import { createInitialTreeState, calculatePracticeGrowth } from './treeGrowthEngine'
import type { PracticeRecord, QualityLevel } from './types'

const makePractice = (
  minutes: number,
  quality: QualityLevel,
  achievements: string[] = ['assigned_section'],
  improvement: PracticeRecord['improvement'] = 'small',
): PracticeRecord => ({
  id: `practice-${minutes}`,
  date: '2026-08-02',
  minutes,
  quality,
  achievements,
  improvement,
  customAchievement: '',
  parentNote: '',
})

describe('practice growth engine', () => {
  it('gives no water for zero minutes', () => {
    const next = calculatePracticeGrowth(createInitialTreeState(), makePractice(0, 'normal'))
    expect(next.updatedState.waterBalance).toBe(0)
    expect(next.changes.some((change) => change.type === 'water')).toBe(false)
  })

  it('gives the expected water for 10 minutes', () => {
    const next = calculatePracticeGrowth(createInitialTreeState(), makePractice(10, 'normal'))
    expect(next.updatedState.waterBalance).toBeGreaterThanOrEqual(2)
    expect(next.updatedState.waterBalance).toBeLessThanOrEqual(3)
  })

  it('caps daily water at the normal maximum for 30 minutes', () => {
    const next = calculatePracticeGrowth(createInitialTreeState(), makePractice(30, 'good'))
    expect(next.updatedState.waterBalance).toBe(3)
  })

  it('does not exceed the daily reward cap at 60 minutes', () => {
    const next = calculatePracticeGrowth(createInitialTreeState(), makePractice(60, 'good'))
    expect(next.updatedState.waterBalance).toBe(3)
  })

  it('increases root strength with good quality practice', () => {
    const next = calculatePracticeGrowth(createInitialTreeState(), makePractice(15, 'good'))
    expect(next.updatedState.rootStrength).toBeGreaterThan(0)
  })

  it('creates leaves for meaningful achievements', () => {
    const next = calculatePracticeGrowth(createInitialTreeState(), makePractice(20, 'good', ['assigned_section', 'rhythm_improved']))
    expect(next.updatedState.leafCount).toBeGreaterThan(24)
  })

  it('creates a flower for clear improvement', () => {
    const next = calculatePracticeGrowth(createInitialTreeState(), makePractice(20, 'good', ['assigned_section'], 'clear'))
    expect(next.updatedState.flowerCount).toBeGreaterThan(2)
  })
})
