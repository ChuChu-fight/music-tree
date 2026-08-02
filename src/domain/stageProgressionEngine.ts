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
    pieceName?: string
    completionDate?: string
    confirmedBy?: string
  }>
  reviewHistory?: Array<{ id: string; date?: string; type?: string }>
  concertRecords?: Array<{
    id: string
    childId?: string
    date?: string
    name?: string
    pieceName?: string
    note?: string
  }>
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

const STAGE_DAY_REQUIREMENTS: Record<number, number> = {
  1: 30,
  2: 45,
  3: 60,
}

const STAGE_PRACTICE_REQUIREMENTS: Record<number, number> = {
  1: 10,
  2: 12,
  3: 15,
}

const STAGE_CYCLE_REQUIREMENTS: Record<number, number> = {
  1: 2,
  2: 3,
  3: 4,
}

const STAGE_PIECE_REQUIREMENTS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
}

const EFFORT_QUALITY = new Set(['focused', 'good', 'normal', 'difficult', 'steady'])

const normalizeDate = (value: string) => {
  if (!value) return null
  const asDate = new Date(`${value}T00:00:00`)
  return Number.isNaN(asDate.getTime()) ? null : asDate
}

const daysBetween = (start: string, end: string) => {
  const startDate = normalizeDate(start)
  const endDate = normalizeDate(end)

  if (!startDate || !endDate) return 0

  const diffMs = endDate.getTime() - startDate.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

const isWithinStage = (date: string, stageEntryDate: string, currentDate: string) => {
  if (!date) return false
  const asDate = normalizeDate(date)
  const start = normalizeDate(stageEntryDate)
  const end = normalizeDate(currentDate)

  if (!asDate || !start || !end) return false

  return asDate >= start && asDate <= end
}

export const evaluateStageProgression = ({
  currentStage,
  stageEntryDate,
  currentDate,
  validPracticeDates = [],
  qualityByDate = {},
  teacherEvaluations = [],
  learningCycles = [],
  completedPieces = [],
  reviewHistory = [],
  concertRecords: _concertRecords = [],
}: StageProgressionInput): StageProgressionResult => {
  const normalizedStage = Math.min(4, Math.max(1, currentStage))
  const nextStage = normalizedStage >= 4 ? 4 : normalizedStage + 1

  const stageDates = [...new Set(validPracticeDates.filter((value) => isWithinStage(value, stageEntryDate, currentDate)))].sort()
  const elapsedDays = daysBetween(stageEntryDate, currentDate)
  const qualityDates = stageDates.filter((date) => {
    const quality = qualityByDate[date]
    return quality ? EFFORT_QUALITY.has(String(quality).toLowerCase()) : false
  })
  const qualityRatio = stageDates.length > 0 ? qualityDates.length / stageDates.length : 0

  const teacherCheckins = teacherEvaluations.filter((evaluation) => {
    const createdAt = evaluation.createdAt
    return isWithinStage(createdAt, stageEntryDate, currentDate) && evaluation.score >= 3
  }).length

  const completedLearningCycles = learningCycles.filter((cycle) => {
    const hasSubmittedWork = (cycle.completedPieceIds?.length ?? 0) > 0
    const hasTeacherEvaluation = Boolean(cycle.teacherEvaluationId)
    const hasStatus = cycle.status === 'completed'
    const hasValidPractice = (cycle.validPracticeDates?.filter((date) => isWithinStage(date, stageEntryDate, currentDate)).length ?? 0) > 0
    return hasStatus || hasSubmittedWork || hasTeacherEvaluation || hasValidPractice
  }).length

  const completedPieceCount = completedPieces.filter((piece) => {
    const completionDate = piece.completionDate
    return completionDate ? isWithinStage(completionDate, stageEntryDate, currentDate) : false
  }).length

  const requiredDays = STAGE_DAY_REQUIREMENTS[normalizedStage] ?? 30
  const requiredPracticeDays = STAGE_PRACTICE_REQUIREMENTS[normalizedStage] ?? 10
  const requiredCycles = STAGE_CYCLE_REQUIREMENTS[normalizedStage] ?? 2
  const requiredPieces = STAGE_PIECE_REQUIREMENTS[normalizedStage] ?? 1

  const requirements: StageRequirement[] = [
    {
      id: 'elapsed-days',
      label: 'Time in the stage',
      required: requiredDays,
      actual: elapsedDays,
      completed: elapsedDays >= requiredDays,
    },
    {
      id: 'practice-days',
      label: 'Distinct valid practice days',
      required: requiredPracticeDays,
      actual: stageDates.length,
      completed: stageDates.length >= requiredPracticeDays,
    },
    {
      id: 'quality-ratio',
      label: 'Quality and effort across the stage',
      required: 60,
      actual: Math.round(qualityRatio * 100),
      completed: qualityRatio >= 0.6,
    },
    {
      id: 'learning-cycles',
      label: 'Completed learning cycles',
      required: requiredCycles,
      actual: completedLearningCycles,
      completed: completedLearningCycles >= requiredCycles,
    },
    {
      id: 'teacher-checkins',
      label: 'Strong teacher check-ins',
      required: 2,
      actual: teacherCheckins,
      completed: teacherCheckins >= 2,
    },
    {
      id: 'completed-pieces',
      label: 'Completed piano pieces',
      required: requiredPieces,
      actual: completedPieceCount,
      completed: completedPieceCount >= requiredPieces,
    },
  ]

  const blockedByReview = reviewHistory.length > 0 && reviewHistory.some((entry) => {
    const reviewDate = entry.date ? normalizeDate(entry.date) : null
    const stageStart = normalizeDate(stageEntryDate)
    const stageEnd = normalizeDate(currentDate)
    return reviewDate && stageStart && stageEnd && reviewDate >= stageStart && reviewDate <= stageEnd && entry.type === 'concern'
  })

  const eligibleForNextStage = normalizedStage < 4
    && requirements.every((requirement) => requirement.completed)
    && !blockedByReview

  const summary = eligibleForNextStage
    ? `Stage ${normalizedStage} is ready to advance to Stage ${nextStage}.`
    : `Stage ${normalizedStage} is still in progress. This stage needs more time, practice consistency, and teacher evidence.`

  return {
    currentStage: normalizedStage,
    nextStage,
    eligibleForNextStage,
    elapsedDays,
    validPracticeDays: stageDates.length,
    qualityRatio,
    teacherCheckins,
    completedLearningCycles,
    completedPieceCount,
    requirements,
    summary,
  }
}
