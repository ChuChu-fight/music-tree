import type { TreeState } from './types'

const daysBetween = (from: string, to: string) => {
  const start = new Date(`${from}T00:00:00Z`).getTime()
  const end = new Date(`${to}T00:00:00Z`).getTime()
  return Math.max(0, Math.floor((end - start) / 86_400_000))
}

export const deriveInactivityTreeState = (treeState: TreeState, currentDate: string): TreeState => {
  if (!treeState.lastPracticeDate) return treeState

  const inactiveDays = daysBetween(treeState.lastPracticeDate, currentDate)
  if (inactiveDays < 4) return { ...treeState, currentInactivityDays: inactiveDays, creatureState: 'hidden' }

  const nibbling = inactiveDays >= 7
  const temporaryGlowLoss = nibbling ? 2 : 1

  return {
    ...treeState,
    currentInactivityDays: inactiveDays,
    creatureState: nibbling ? 'nibbling' : 'watching',
    leafCount: treeState.leafCount,
    glowLevel: Math.max(0, treeState.glowLevel - temporaryGlowLoss),
  }
}
