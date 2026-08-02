export type FruitUnlockReason =
  | 'practice_and_pieces'
  | 'two_highest_teacher_scores'
  | 'concert_performance'

export type FamilyReward = {
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type SpecialFruit = {
  id: string
  childId: string
  unlockReason: FruitUnlockReason
  sourceEventIds: string[]
  selectedRewardId?: string
  selectedRewardName?: string
  status: 'unopened' | 'opened' | 'completed'
  unlockedAt: string
  openedAt?: string
  completedAt?: string
}

export type RewardProgress = {
  childId: string
  rewardPracticeDates: string[]
  rewardCompletedPieceIds: string[]
  rewardHighestTeacherEvaluationIds: string[]
  updatedAt: string
}

export type CompletedPiece = {
  id: string
  pieceName: string
  completionDate: string
  confirmedBy: 'parent' | 'teacher'
  note?: string
}

export type ConcertRecord = {
  id: string
  childId: string
  name: string
  date: string
  pieceName: string
  note?: string
  createdAt: string
}

export type UnlockInput = {
  practiceRecords: Array<{ id: string; date: string; minutes: number }>
  completedPieces: CompletedPiece[]
  teacherEvaluations: Array<{ id: string; score: number; createdAt: string }>
  concerts: ConcertRecord[]
  rewards: FamilyReward[]
  existingFruits: SpecialFruit[]
  progress: RewardProgress
}

export type UnlockResult = {
  fruitsCreated: SpecialFruit[]
  progress: RewardProgress
}

export const defaultRewards: FamilyReward[] = [
  { id: 'reward_movie', name: 'Choose the family movie', active: true, createdAt: '2026-08-01', updatedAt: '2026-08-01' },
  { id: 'reward_ice_cream', name: 'Visit an ice-cream shop', active: true, createdAt: '2026-08-01', updatedAt: '2026-08-01' },
  { id: 'reward_playdate', name: 'Invite a friend for a playdate', active: false, createdAt: '2026-08-01', updatedAt: '2026-08-01' },
]

const getActiveRewards = (rewards: FamilyReward[]) => rewards.filter((reward) => reward.active)

const makeFruit = (childId: string, unlockReason: FruitUnlockReason, sourceEventIds: string[], now: string): SpecialFruit => ({
  id: `fruit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  childId,
  unlockReason,
  sourceEventIds,
  status: 'unopened',
  unlockedAt: now,
})

export const evaluateSpecialFruitUnlocks = ({
  practiceRecords,
  completedPieces,
  teacherEvaluations,
  concerts,
  rewards,
  existingFruits,
  progress,
}: UnlockInput): UnlockResult => {
  const now = new Date().toISOString()
  const created: SpecialFruit[] = []
  const activeRewards = getActiveRewards(rewards)

  const validPracticeDates = [...new Set(
    practiceRecords
      .filter((entry) => entry.minutes >= 5)
      .map((entry) => entry.date),
  )]

  const relevantPracticeDates = validPracticeDates.filter((date) => {
    const dateMatches = progress.rewardPracticeDates.includes(date)
    return !dateMatches
  })

  const combinedPracticeDates = [...new Set([...progress.rewardPracticeDates, ...relevantPracticeDates])]

  const uniqueCompletedPieceIds = [...new Set(completedPieces.map((piece) => piece.id))]
  const newCompletedPieceIds = uniqueCompletedPieceIds.filter(
    (id) => !progress.rewardCompletedPieceIds.includes(id),
  )

  const nextProgress: RewardProgress = {
    ...progress,
    rewardPracticeDates: combinedPracticeDates,
    rewardCompletedPieceIds: [...new Set([...progress.rewardCompletedPieceIds, ...newCompletedPieceIds])],
    updatedAt: now,
  }

  const hasPracticeCondition =
    new Set(nextProgress.rewardPracticeDates).size >= 6 &&
    new Set(nextProgress.rewardCompletedPieceIds).size >= 2

  if (hasPracticeCondition && activeRewards.length > 0) {
    const fruit = makeFruit(progress.childId, 'practice_and_pieces', ['practice_condition', ...newCompletedPieceIds], now)
    const alreadyExists = existingFruits.some((entry) => entry.unlockReason === 'practice_and_pieces' && entry.sourceEventIds.includes('practice_condition'))
    if (!alreadyExists) {
      created.push(fruit)
      nextProgress.rewardPracticeDates = []
      nextProgress.rewardCompletedPieceIds = []
    }
  }

  const scoreFiveIds = teacherEvaluations
    .filter((evaluation) => evaluation.score === 5)
    .map((evaluation) => evaluation.id)

  const newScoreFiveIds = scoreFiveIds.filter((id) => !progress.rewardHighestTeacherEvaluationIds.includes(id))

  const scoreConditionMet = new Set([...progress.rewardHighestTeacherEvaluationIds, ...newScoreFiveIds]).size >= 2

  if (scoreConditionMet && activeRewards.length > 0) {
    const fruit = makeFruit(progress.childId, 'two_highest_teacher_scores', newScoreFiveIds.slice(0, 2), now)
    const alreadyExists = existingFruits.some((entry) => entry.unlockReason === 'two_highest_teacher_scores')
    if (!alreadyExists) {
      created.push(fruit)
      nextProgress.rewardHighestTeacherEvaluationIds = []
    }
  } else {
    nextProgress.rewardHighestTeacherEvaluationIds = [...new Set([...progress.rewardHighestTeacherEvaluationIds, ...newScoreFiveIds])]
  }

  const newConcertIds = concerts
    .filter((concert) => !existingFruits.some((fruit) => fruit.unlockReason === 'concert_performance' && fruit.sourceEventIds.includes(concert.id)))
    .map((concert) => concert.id)

  if (newConcertIds.length > 0 && activeRewards.length > 0) {
    const fruit = makeFruit(progress.childId, 'concert_performance', newConcertIds, now)
    created.push(fruit)
  }

  return {
    fruitsCreated: created,
    progress: nextProgress,
  }
}

export const chooseRandomReward = (rewards: FamilyReward[]) => {
  const activeRewards = getActiveRewards(rewards)
  if (activeRewards.length === 0) return null
  const selectedReward = activeRewards[Math.floor(Math.random() * activeRewards.length)]
  return selectedReward
}
