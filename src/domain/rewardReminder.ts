export type RewardReminderStatus = 'pending' | 'granted' | 'skipped'

export type RewardReminder = {
  id: string
  childId: string
  leafMilestone: number
  status: RewardReminderStatus
  createdAt: string
  handledAt?: string
}

export const rewardMilestoneForLeafCount = (earnedLeafCount: number) =>
  earnedLeafCount > 0 && earnedLeafCount % 5 === 0 ? earnedLeafCount : null

export const ensureRewardReminder = (reminders: RewardReminder[], childId: string, earnedLeafCount: number, createdAt: string) => {
  const milestone = rewardMilestoneForLeafCount(earnedLeafCount)
  if (milestone === null || reminders.some((reminder) => reminder.childId === childId && reminder.leafMilestone === milestone)) return reminders
  const reminder: RewardReminder = { id: `reward_reminder_${childId}_${milestone}`, childId, leafMilestone: milestone, status: 'pending', createdAt }
  return [...reminders, reminder]
}

export const ensureCrossedRewardReminders = (reminders: RewardReminder[], childId: string, previousEarnedLeafCount: number, earnedLeafCount: number, createdAt: string, migrationBaseline = 0) => {
  const firstCandidate = Math.floor(Math.max(previousEarnedLeafCount, migrationBaseline) / 5) * 5 + 5
  const next = [...reminders]
  for (let milestone = firstCandidate; milestone <= earnedLeafCount; milestone += 5) {
    if (!next.some((reminder) => reminder.childId === childId && reminder.leafMilestone === milestone)) next.push({ id: `reward_reminder_${childId}_${milestone}`, childId, leafMilestone: milestone, status: 'pending', createdAt })
  }
  return next
}

export const selectDominantPendingReminder = (reminders: RewardReminder[], childId: string) =>
  reminders.filter((reminder) => reminder.childId === childId && reminder.status === 'pending').sort((left, right) => right.leafMilestone - left.leafMilestone)[0] ?? null
