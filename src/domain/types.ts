export type AppRole = 'child' | 'parent' | 'teacher'

export type QualityLevel = 'low' | 'normal' | 'good'
export type ImprovementLevel = 'none' | 'small' | 'clear' | 'breakthrough'

export type TreeState = {
  treeHealth: number
  growthLevel: number
  waterBalance: number
  rootStrength: number
  leafCount: number
  flowerCount: number
  fruitCount: number
  branchLevel: number
  glowLevel: number
  currentInactivityDays: number
  creatureState: 'hidden' | 'watching' | 'nibbling' | 'recovering'
  recoveryState: 'stable' | 'recovering'
  unlockedDecorations: string[]
  unlockedCreatures: string[]
  completedPieces: string[]
  totalPracticeDays: number
  totalPracticeMinutes: number
  currentPracticeStreak: number
  longestPracticeStreak: number
  lastPracticeDate: string | null
  lastTeacherEvaluationDate: string | null
  stage: number
  message: string
}

export type PracticeRecord = {
  id: string
  date: string
  minutes: number
  quality: QualityLevel
  achievements: string[]
  customAchievement: string
  improvement: ImprovementLevel
  parentNote: string
}

export type DailyGrowthChange = {
  type: 'water' | 'leaf' | 'flower' | 'glow' | 'root'
  amount: number
  label?: string
}

export type GrowthEngineResult = {
  updatedState: TreeState
  changes: DailyGrowthChange[]
  message: string
}

export type HomeworkAssignment = {
  id: string
  childId: string
  pieceName: string
  section: string
  focus: string
  instruction: string
  recommendedPracticeDays: number
  targetMinutes: number
  status: 'active' | 'completed'
  assignedAt: string
}

export type TeacherEvaluation = {
  id: string
  childId: string
  homeworkId: string
  score: number
  improvement: ImprovementLevel
  teacherComment: string
  completedPiece: boolean
  completedPieceName: string
  createdAt: string
}

export type StageRequirement = {
  id: string
  label: string
  required: number
  actual: number
  completed: boolean
}

export type StageProgressionInput = {
  currentStage: number
  stageEntryDate: string
  currentDate: string
  validPracticeDates?: string[]
  qualityByDate?: Record<string, string>
  teacherEvaluations?: Array<{
    id: string
    createdAt: string
    score: number
    improvement?: string
  }>
  learningCycles?: Array<{
    id: string
    childId?: string
    homeworkId?: string
    startedAt?: string
    validPracticeDates?: string[]
    teacherEvaluationId?: string | null
    completedPieceIds?: string[]
    status?: string
  }>
  completedPieces?: Array<{
    id: string
    completionDate?: string
    confirmedBy?: string
  }>
  reviewHistory?: Array<{ id: string; date?: string; type?: string }>
  concertRecords?: Array<{ id: string; date?: string; name?: string }>
}

export type StageProgressionResult = {
  currentStage: number
  nextStage: number
  eligibleForNextStage: boolean
  elapsedDays: number
  validPracticeDays: number
  qualityRatio: number
  teacherCheckins: number
  completedLearningCycles: number
  completedPieceCount: number
  requirements: StageRequirement[]
  summary: string
}
