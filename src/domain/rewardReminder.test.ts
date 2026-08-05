import { describe, expect, it } from 'vitest'
import { ensureRewardReminder, rewardMilestoneForLeafCount, selectDominantPendingReminder, type RewardReminder } from './rewardReminder'

describe('reward reminder milestones', () => {
  it('creates reminders only at exact five-leaf milestones', () => {
    expect(rewardMilestoneForLeafCount(4)).toBeNull()
    expect(rewardMilestoneForLeafCount(5)).toBe(5)
    expect(rewardMilestoneForLeafCount(6)).toBeNull()
    expect(rewardMilestoneForLeafCount(10)).toBe(10)
  })

  it('is idempotent per child and exact leaf total', () => {
    const five = ensureRewardReminder([], 'child_001', 5, '2026-08-04T10:00:00Z')
    expect(five).toHaveLength(1)
    expect(ensureRewardReminder(five, 'child_001', 5, 'later')).toEqual(five)
    expect(ensureRewardReminder(five, 'child_001', 6, 'later')).toEqual(five)
    expect(ensureRewardReminder(five, 'child_001', 10, 'later')).toHaveLength(2)
  })

  it('selects only the newest pending milestone as dominant', () => {
    const reminders: RewardReminder[] = [
      { id: 'five', childId: 'child_001', leafMilestone: 5, status: 'pending', createdAt: 'a' },
      { id: 'ten', childId: 'child_001', leafMilestone: 10, status: 'pending', createdAt: 'b' },
      { id: 'fifteen', childId: 'child_001', leafMilestone: 15, status: 'skipped', createdAt: 'c', handledAt: 'd' },
    ]
    expect(selectDominantPendingReminder(reminders, 'child_001')?.leafMilestone).toBe(10)
  })
})
