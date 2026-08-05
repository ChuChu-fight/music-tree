export type LeafGrowthEvent = { id: string; childId: string; date: string; sourceWater: 3; sourceHealth: 100; createdAt: string }

export type LeafState = { migrationBaseEarnedLeafCount: number; eventLeafCount: number; earnedLeafCount: number; temporaryHiddenLeafCount: number; minimumVisibleBase: number; visibleLeafCount: number }

export const leafGrowthEventId = (childId: string, date: string) => `leaf_growth_${childId}_${date}`

export const createLeafGrowthEvent = ({ childId, date, water, health, existingEvents, createdAt }: { childId: string; date: string; water: number; health: number; existingEvents: LeafGrowthEvent[]; createdAt: string }) => {
  if (water !== 3 || health !== 100 || existingEvents.some((event) => event.childId === childId && event.date === date)) return null
  return { id: leafGrowthEventId(childId, date), childId, date, sourceWater: 3, sourceHealth: 100, createdAt } satisfies LeafGrowthEvent
}

export const selectLeafState = ({ migrationBaseEarnedLeafCount, events, childId, health }: { migrationBaseEarnedLeafCount: number; events: LeafGrowthEvent[]; childId: string; health: number }): LeafState => {
  const eventLeafCount = new Set(events.filter((event) => event.childId === childId).map((event) => event.date)).size
  const earnedLeafCount = Math.max(0, migrationBaseEarnedLeafCount) + eventLeafCount
  const minimumVisibleBase = Math.min(earnedLeafCount, 3)
  const temporaryHiddenLeafCount = health < 60 ? Math.min(5, Math.max(0, earnedLeafCount - minimumVisibleBase)) : 0
  return { migrationBaseEarnedLeafCount, eventLeafCount, earnedLeafCount, temporaryHiddenLeafCount, minimumVisibleBase, visibleLeafCount: earnedLeafCount - temporaryHiddenLeafCount }
}
