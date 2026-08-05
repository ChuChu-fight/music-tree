import type { HomeworkItem, HomeworkItemEvaluation, HomeworkItemScore, HomeworkItemType, StarRating, TeacherLessonEvaluation } from './types'

export const starRatingToPercentage = (starRating: StarRating): HomeworkItemScore => (starRating * 20) as HomeworkItemScore

export const validateHomeworkItem = (item: Pick<HomeworkItem, 'title' | 'section' | 'instruction'> & { type?: HomeworkItemType }) => {
  if (!item.title.trim()) return 'Enter a piece or exercise name.'
  if ((item.section?.length ?? 0) > 120) return 'Section, bars, or page must be 120 characters or fewer.'
  if ((item.instruction?.length ?? 0) > 200) return 'Instruction must be 200 characters or fewer.'
  if (item.type && !['piece', 'scale', 'rhythm', 'technique', 'other'].includes(item.type)) return 'Choose a valid homework type.'
  return null
}

export const validateItemEvaluations = (activeItems: HomeworkItem[], evaluations: HomeworkItemEvaluation[]) => {
  if (activeItems.length === 0) return 'There are no active homework items to evaluate.'
  if (evaluations.length !== activeItems.length) return 'Evaluate every active homework item.'
  const activeIds = new Set(activeItems.map((item) => item.id))
  if (new Set(evaluations.map((evaluation) => evaluation.homeworkItemId)).size !== evaluations.length) return 'Each homework item can be evaluated only once.'
  for (const evaluation of evaluations) {
    if (!activeIds.has(evaluation.homeworkItemId)) return 'An evaluation refers to an inactive homework item.'
    if (![20, 40, 60, 80, 100].includes(evaluation.score)) return 'Select one of the five preparation percentages.'
    if (!['none', 'small', 'clear', 'big'].includes(evaluation.improvement)) return 'Select an improvement level for every homework item.'
  }
  return null
}

export const createLessonEvaluation = ({
  childId,
  activeItems,
  itemEvaluations,
  now,
  lessonDate,
  id,
}: {
  childId: string
  activeItems: HomeworkItem[]
  itemEvaluations: HomeworkItemEvaluation[]
  now: string
  lessonDate: string
  id: string
}): TeacherLessonEvaluation => {
  const error = validateItemEvaluations(activeItems, itemEvaluations)
  if (error) throw new Error(error)
  return {
    id,
    childId,
    lessonDate,
    itemEvaluations: itemEvaluations.map((evaluation) => ({ ...evaluation })),
    createdAt: now,
  }
}
