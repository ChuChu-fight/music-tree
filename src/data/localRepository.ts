import { createInitialTreeState } from '../domain/treeGrowthEngine'
import {
  defaultRewards,
  type CompletedPiece,
  type ConcertRecord,
  type FamilyReward,
  type RewardProgress,
  type SpecialFruit,
} from '../domain/specialFruitEngine'
import type { HomeworkAssignment, PracticeRecord, TeacherEvaluation, TreeState } from '../domain/types'

const today = new Date().toISOString().slice(0, 10)

export const demoHomework: HomeworkAssignment = {
  id: 'homework_001',
  childId: 'child_001',
  pieceName: 'Little Snow Waltz',
  section: 'Bars 1-16',
  focus: 'Steady rhythm and finger calmness',
  instruction: 'Practise gently and count each beat out loud.',
  recommendedPracticeDays: 4,
  targetMinutes: 15,
  status: 'active',
  assignedAt: '2026-08-01',
}

export const demoPracticeRecords: PracticeRecord[] = [
  {
    id: 'practice_001',
    date: '2026-07-28',
    minutes: 15,
    quality: 'good',
    achievements: ['assigned_section', 'rhythm_improved'],
    customAchievement: '',
    improvement: 'small',
    parentNote: 'Steady and musical today.',
  },
  {
    id: 'practice_002',
    date: '2026-07-29',
    minutes: 20,
    quality: 'good',
    achievements: ['completed_today_task', 'tried_without_help'],
    customAchievement: '',
    improvement: 'clear',
    parentNote: 'The phrase sounded more even.',
  },
  {
    id: 'practice_003',
    date: '2026-07-30',
    minutes: 10,
    quality: 'normal',
    achievements: ['assigned_section'],
    customAchievement: '',
    improvement: 'small',
    parentNote: 'A little slower today but careful.',
  },
  {
    id: 'practice_004',
    date: '2026-07-31',
    minutes: 25,
    quality: 'good',
    achievements: ['played_difficult_section', 'remembered_notes_independently'],
    customAchievement: '',
    improvement: 'clear',
    parentNote: 'Lovely focus and confidence.',
  },
  {
    id: 'practice_005',
    date: '2026-08-01',
    minutes: 18,
    quality: 'good',
    achievements: ['assigned_section'],
    customAchievement: '',
    improvement: 'small',
    parentNote: 'Nice calm start to the week.',
  },
  {
    id: 'practice_006',
    date: '2026-08-02',
    minutes: 12,
    quality: 'normal',
    achievements: ['played_whole_piece'],
    customAchievement: '',
    improvement: 'clear',
    parentNote: 'A cheerful, strong run through the piece.',
  },
  {
    id: 'practice_007',
    date: today,
    minutes: 15,
    quality: 'good',
    achievements: ['assigned_section', 'improved_rhythm'],
    customAchievement: '',
    improvement: 'small',
    parentNote: 'The rhythm felt smoother.',
  },
]

export const demoTeacherEvaluations: TeacherEvaluation[] = [
  {
    id: 'evaluation_001',
    childId: 'child_001',
    homeworkId: 'homework_001',
    score: 4,
    improvement: 'clear',
    teacherComment: 'A lovely week. The rhythm is steadier and the mood is musical.',
    completedPiece: false,
    completedPieceName: '',
    createdAt: '2026-08-01T15:30:00.000Z',
  },
]

export const demoCompletedPieces: CompletedPiece[] = [
  {
    id: 'completed_piece_001',
    pieceName: 'Little Star',
    completionDate: '2026-08-02',
    confirmedBy: 'teacher',
    note: 'Lovely relaxed playing.',
  },
]

export const demoConcerts: ConcertRecord[] = []

export const demoRewards: FamilyReward[] = defaultRewards

export const demoRewardProgress: RewardProgress = {
  childId: 'child_001',
  rewardPracticeDates: ['2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31'],
  rewardCompletedPieceIds: ['completed_piece_001'],
  rewardHighestTeacherEvaluationIds: [],
  updatedAt: '2026-08-01',
}

export const demoFruitHistory: SpecialFruit[] = []

export const demoTreeState: TreeState = {
  ...createInitialTreeState(),
  leafCount: 28,
  flowerCount: 3,
  glowLevel: 2,
  totalPracticeDays: demoPracticeRecords.length,
  totalPracticeMinutes: demoPracticeRecords.reduce((sum, record) => sum + record.minutes, 0),
  currentPracticeStreak: 4,
  longestPracticeStreak: 5,
  lastPracticeDate: demoPracticeRecords[demoPracticeRecords.length - 1].date,
  message: 'The tree is glowing with happy practice memories.',
}

export const localRepository = {
  getPracticeRecords: () => [...demoPracticeRecords],
  addPracticeRecord: (record: PracticeRecord) => {
    demoPracticeRecords.unshift(record)
    return record
  },
  getCurrentHomework: () => ({ ...demoHomework }),
  getTeacherEvaluations: () => [...demoTeacherEvaluations],
  addTeacherEvaluation: (evaluation: TeacherEvaluation) => {
    demoTeacherEvaluations.unshift(evaluation)
    return evaluation
  },
  getCompletedPieces: () => [...demoCompletedPieces],
  saveCompletedPieces: (pieces: CompletedPiece[]) => {
    demoCompletedPieces.splice(0, demoCompletedPieces.length, ...pieces)
    return [...demoCompletedPieces]
  },
  getConcerts: () => [...demoConcerts],
  saveConcerts: (concerts: ConcertRecord[]) => {
    demoConcerts.splice(0, demoConcerts.length, ...concerts)
    return [...demoConcerts]
  },
  getRewards: () => [...demoRewards],
  saveRewards: (rewards: FamilyReward[]) => {
    demoRewards.splice(0, demoRewards.length, ...rewards)
    return [...demoRewards]
  },
  getRewardProgress: () => ({ ...demoRewardProgress, rewardPracticeDates: [...demoRewardProgress.rewardPracticeDates], rewardCompletedPieceIds: [...demoRewardProgress.rewardCompletedPieceIds], rewardHighestTeacherEvaluationIds: [...demoRewardProgress.rewardHighestTeacherEvaluationIds] }),
  saveRewardProgress: (progress: RewardProgress) => {
    Object.assign(demoRewardProgress, progress)
    return { ...demoRewardProgress, rewardPracticeDates: [...demoRewardProgress.rewardPracticeDates], rewardCompletedPieceIds: [...demoRewardProgress.rewardCompletedPieceIds], rewardHighestTeacherEvaluationIds: [...demoRewardProgress.rewardHighestTeacherEvaluationIds] }
  },
  getSpecialFruits: () => [...demoFruitHistory],
  saveSpecialFruits: (fruits: SpecialFruit[]) => {
    demoFruitHistory.splice(0, demoFruitHistory.length, ...fruits)
    return [...demoFruitHistory]
  },
  getTreeState: () => ({ ...demoTreeState }),
  saveTreeState: (state: TreeState) => {
    Object.assign(demoTreeState, state)
    return { ...demoTreeState }
  },
}
