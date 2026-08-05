import { describe, expect, it } from 'vitest'
import { createLeafGrowthEvent, leafGrowthEventId, selectLeafState, type LeafGrowthEvent } from './leafGrowth'
import { ensureCrossedRewardReminders } from './rewardReminder'

const event = (date: string, childId = 'child'): LeafGrowthEvent => ({ id: leafGrowthEventId(childId, date), childId, date, sourceWater: 3, sourceHealth: 100, createdAt: `${date}T12:00:00.000Z` })

describe('permanent LeafGrowthEvents', () => {
  it('requires Water 3 and Health 100', () => {
    expect(createLeafGrowthEvent({ childId: 'child', date: '2026-01-01', water: 2, health: 100, existingEvents: [], createdAt: 'now' })).toBeNull()
    expect(createLeafGrowthEvent({ childId: 'child', date: '2026-01-01', water: 3, health: 99, existingEvents: [], createdAt: 'now' })).toBeNull()
    expect(createLeafGrowthEvent({ childId: 'child', date: '2026-01-01', water: 3, health: 100, existingEvents: [], createdAt: 'now' })).toMatchObject({ id: 'leaf_growth_child_2026-01-01', sourceWater: 3, sourceHealth: 100 })
  })

  it('allows maximum one stable event per child/date and another date may earn one', () => {
    const existing = [event('2026-01-01')]
    expect(createLeafGrowthEvent({ childId: 'child', date: '2026-01-01', water: 3, health: 100, existingEvents: existing, createdAt: 'later' })).toBeNull()
    expect(createLeafGrowthEvent({ childId: 'child', date: '2026-01-02', water: 3, health: 100, existingEvents: existing, createdAt: 'later' })?.id).toBe('leaf_growth_child_2026-01-02')
  })

  it('keeps earned count independent of Stage slot capacity', () => {
    const events = Array.from({ length: 80 }, (_, index) => event(`2026-${String(Math.floor(index / 28) + 1).padStart(2, '0')}-${String(index % 28 + 1).padStart(2, '0')}`))
    expect(selectLeafState({ migrationBaseEarnedLeafCount: 24, events, childId: 'child', health: 100 }).earnedLeafCount).toBe(104)
  })

  it('temporarily hides up to five below Health 60 and restores at 60', () => {
    const low = selectLeafState({ migrationBaseEarnedLeafCount: 10, events: [], childId: 'child', health: 59 })
    expect(low).toMatchObject({ earnedLeafCount: 10, temporaryHiddenLeafCount: 5, minimumVisibleBase: 3, visibleLeafCount: 5 })
    expect(selectLeafState({ migrationBaseEarnedLeafCount: 10, events: [], childId: 'child', health: 60 })).toMatchObject({ earnedLeafCount: 10, temporaryHiddenLeafCount: 0, visibleLeafCount: 10 })
  })

  it('keeps the minimum visible base for small earned counts', () => {
    expect(selectLeafState({ migrationBaseEarnedLeafCount: 2, events: [], childId: 'child', health: 0 })).toMatchObject({ minimumVisibleBase: 2, visibleLeafCount: 2 })
    expect(selectLeafState({ migrationBaseEarnedLeafCount: 4, events: [], childId: 'child', health: 0 }).visibleLeafCount).toBe(3)
  })

  it('creates every crossed milestone once, including a 4 to 6 jump', () => {
    const reminders = ensureCrossedRewardReminders([], 'child', 4, 6, 'now')
    expect(reminders.map((item) => item.leafMilestone)).toEqual([5])
    expect(ensureCrossedRewardReminders(reminders, 'child', 4, 6, 'later')).toEqual(reminders)
    expect(ensureCrossedRewardReminders(reminders, 'child', 6, 11, 'later').map((item) => item.leafMilestone)).toEqual([5, 10])
  })

  it('does not flood reminders below a legacy migration baseline', () => expect(ensureCrossedRewardReminders([], 'child', 24, 25, 'now', 28)).toEqual([]))
})
