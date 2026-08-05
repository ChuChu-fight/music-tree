import { describe, expect, it } from 'vitest'
import { calculatePracticeWater, selectDailyWater, type WaterPracticeRecord } from './water'

const record = (minutes: number, quality: string | null = 'normal', id = String(minutes), childId = 'child', date = '2026-08-04'): WaterPracticeRecord => ({ id, childId, date, minutes, quality })

describe('practice Water', () => {
  it.each([
    [4, 'normal', 0],
    [5, null, 0],
    [5, 'normal', 1],
    [9, 'normal', 1],
    [10, 'normal', 2],
    [19, 'normal', 2],
    [20, 'normal', 3],
  ])('%s minutes with quality %s gives %s Water', (minutes, quality, expected) => expect(calculatePracticeWater(record(minutes, quality))).toBe(expected))

  it('one twenty-minute record reaches daily 3/3', () => expect(selectDailyWater([record(20)], 'child', '2026-08-04')).toBe(3))
  it('accumulates multiple records and caps the daily sum at 3', () => {
    expect(selectDailyWater([record(5, 'normal', 'one'), record(10, 'focused', 'two')], 'child', '2026-08-04')).toBe(3)
    expect(selectDailyWater([record(20, 'normal', 'one'), record(20, 'focused', 'two')], 'child', '2026-08-04')).toBe(3)
  })
  it('selects independently by child and date, with the next date starting at zero', () => {
    const records = [record(20, 'normal', 'one'), record(20, 'normal', 'other-child', 'other'), record(20, 'normal', 'other-date', 'child', '2026-08-05')]
    expect(selectDailyWater(records, 'child', '2026-08-04')).toBe(3)
    expect(selectDailyWater(records, 'other', '2026-08-04')).toBe(3)
    expect(selectDailyWater(records, 'child', '2026-08-06')).toBe(0)
  })
})
