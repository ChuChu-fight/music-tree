import type { HomeworkItemImprovementLevel } from './types'

export type RootAward = {
  lessonEvaluationId: string
  completedCycle: boolean
  completedPieceCategory: boolean
  bigImprovement: boolean
  points: number
  createdAt: string
}

export const calculateLessonRootAward = (values: {
  lessonEvaluationId: string
  completedCycle: boolean
  newlyCompletedPieceCount: number
  improvements: HomeworkItemImprovementLevel[]
  createdAt: string
}): RootAward => {
  const completedPieceCategory = values.newlyCompletedPieceCount > 0
  const bigImprovement = values.improvements.includes('big')
  const points = Number(values.completedCycle) + Number(completedPieceCategory) + Number(bigImprovement)
  return { lessonEvaluationId: values.lessonEvaluationId, completedCycle: values.completedCycle, completedPieceCategory, bigImprovement, points: Math.min(points, 3), createdAt: values.createdAt }
}

export const totalRootAwardPoints = (awards: RootAward[]) => [...new Map(awards.map((award) => [award.lessonEvaluationId, award])).values()].reduce((sum, award) => sum + Math.min(Math.max(award.points, 0), 3), 0)
