import type { GrowthEngineResult, PracticeRecord, QualityLevel, TreeState } from './types'

export const createInitialTreeState = (): TreeState => ({
  treeHealth: 75,
  growthLevel: 2,
  waterBalance: 0,
  rootStrength: 3,
  leafCount: 24,
  flowerCount: 2,
  fruitCount: 0,
  branchLevel: 2,
  glowLevel: 1,
  currentInactivityDays: 0,
  creatureState: 'hidden',
  recoveryState: 'stable',
  unlockedDecorations: ['moon-glow'],
  unlockedCreatures: [],
  completedPieces: [],
  totalPracticeDays: 0,
  totalPracticeMinutes: 0,
  currentPracticeStreak: 0,
  longestPracticeStreak: 0,
  lastPracticeDate: null,
  lastTeacherEvaluationDate: null,
  stage: 1,
  message: 'Your Music Tree is glowing softly tonight.',
})

const qualityBoost: Record<QualityLevel, number> = { low: 0, normal: 1, good: 2 }

const getWaterUnits = (minutes: number) => {
  if (minutes <= 0) return 0
  if (minutes <= 9) return 1
  if (minutes <= 19) return 2
  if (minutes <= 30) return 3
  return 3
}

const getMeaningfulAchievements = (achievements: string[]) =>
  achievements.filter(
    (achievement) =>
      achievement &&
      !['other'].includes(achievement) &&
      achievement.length > 0,
  )

export const calculatePracticeGrowth = (
  currentState: TreeState,
  practice: PracticeRecord,
): GrowthEngineResult => {
  const effectiveMinutes = Math.min(Math.max(practice.minutes, 0), 120)
  const waterAmount = getWaterUnits(effectiveMinutes)
  const rootStrengthGain = qualityBoost[practice.quality] ?? 0
  const meaningfulAchievements = getMeaningfulAchievements(practice.achievements)
  const achievementLeaves = Math.min(meaningfulAchievements.length, 2)
  const improvementFlowerBoost = {
    none: 0,
    small: 0,
    clear: 1,
    breakthrough: 2,
  }[practice.improvement]

  const nextState: TreeState = {
    ...currentState,
    waterBalance: Math.min(currentState.waterBalance + waterAmount, 3),
    rootStrength: currentState.rootStrength + rootStrengthGain,
    leafCount: Math.max(currentState.leafCount + achievementLeaves, 12),
    flowerCount: currentState.flowerCount + (improvementFlowerBoost > 0 ? 1 : 0),
    glowLevel: Math.min(currentState.glowLevel + (waterAmount > 0 ? 1 : 0), 5),
    totalPracticeDays: currentState.totalPracticeDays + 1,
    totalPracticeMinutes: currentState.totalPracticeMinutes + effectiveMinutes,
    currentPracticeStreak: currentState.currentPracticeStreak + 1,
    longestPracticeStreak: Math.max(currentState.longestPracticeStreak, currentState.currentPracticeStreak + 1),
    lastPracticeDate: practice.date,
    currentInactivityDays: 0,
    creatureState: 'hidden',
    recoveryState: 'recovering',
    treeHealth: Math.min(currentState.treeHealth + 4, 100),
    growthLevel: Math.max(currentState.growthLevel, Math.min(4, 1 + Math.floor((currentState.totalPracticeMinutes + effectiveMinutes) / 45))),
    stage: Math.max(currentState.stage, 1 + Math.min(3, Math.floor((currentState.totalPracticeMinutes + effectiveMinutes) / 60))),
  }

  const changes = [] as GrowthEngineResult['changes']
  if (waterAmount > 0) {
    changes.push({ type: 'water', amount: waterAmount, label: 'water' })
  }
  if (achievementLeaves > 0) {
    changes.push({ type: 'leaf', amount: achievementLeaves, label: 'new leaves' })
  }
  if (improvementFlowerBoost > 0) {
    changes.push({ type: 'flower', amount: 1, label: 'crystal flower' })
  }
  if (rootStrengthGain > 0) {
    changes.push({ type: 'root', amount: rootStrengthGain, label: 'roots' })
  }

  let message = 'Your music gave the tree a little glow.'
  if (waterAmount > 0 && achievementLeaves > 0) {
    message = 'Your music gave the tree two water drops. A new crystal leaf appeared.'
  } else if (waterAmount > 0) {
    message = 'Your music gave the tree some gentle water and a bright sparkle.'
  } else if (achievementLeaves > 0) {
    message = 'A fresh leaf shimmered into place.'
  } else if (improvementFlowerBoost > 0) {
    message = 'Your careful practice helped a crystal flower bloom.'
  }

  return { updatedState: nextState, changes, message }
}
