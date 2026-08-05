import type { PracticeRecord, TeacherLessonEvaluation } from './types'
import { isVacationDay, type VacationPeriod } from './vacation'

export const INITIAL_HEALTH = 80
const dayMs = 86_400_000

export type HealthDay = { date: string; baseHealth: number; parentContribution: number; teacherContribution: number; finalHealth: number }
export type HealthReplay = { anchorDate: string; currentDate: string; currentHealth: number; days: HealthDay[] }

const clampHealth = (value: number) => Math.min(100, Math.max(0, Math.round(value)))
const addDay = (date: string) => new Date(new Date(`${date}T00:00:00Z`).getTime() + dayMs).toISOString().slice(0, 10)

export const parentHealthContribution = (record: Pick<PracticeRecord, 'quality' | 'achievements' | 'customAchievement' | 'improvement'>) => {
  const achievement = record.achievements.some((value) => value && value !== 'other') || (record.achievements.includes('other') && record.customAchievement.trim().length > 0) ? 5 : 0
  const quality = { difficult: 5, normal: 10, focused: 15 }[record.quality] ?? 0
  const improvement = { none: 0, small: 5, clear: 10, breakthrough: 15 }[record.improvement] ?? 0
  return achievement + quality + improvement
}

export const teacherItemHealthContribution = (item: TeacherLessonEvaluation['itemEvaluations'][number]) => {
  const completion = item.completed ? 15 : 0
  const stars = item.score / 20
  const improvement = { none: 0, small: 5, clear: 10, big: 15 }[item.improvement] ?? 0
  return completion + stars + improvement
}

export const selectHealthAnchorDate = (practiceRecords: PracticeRecord[], lessonEvaluations: TeacherLessonEvaluation[], currentDate: string) => {
  const evidenceDates = [...practiceRecords.map((record) => record.date), ...lessonEvaluations.map((lesson) => lesson.lessonDate)].filter((date) => date <= currentDate).sort()
  return evidenceDates[0] ?? currentDate
}

export const replayHealth = ({ practiceRecords, lessonEvaluations, currentDate, anchorDate, vacationPeriods = [] }: { practiceRecords: PracticeRecord[]; lessonEvaluations: TeacherLessonEvaluation[]; currentDate: string; anchorDate?: string; vacationPeriods?: VacationPeriod[] }): HealthReplay => {
  const anchor = anchorDate && anchorDate <= currentDate ? anchorDate : selectHealthAnchorDate(practiceRecords, lessonEvaluations, currentDate)
  const practicesById = [...new Map(practiceRecords.filter((record) => record.date >= anchor && record.date <= currentDate).map((record) => [record.id, record])).values()]
  const lessonsById = [...new Map(lessonEvaluations.filter((lesson) => lesson.lessonDate >= anchor && lesson.lessonDate <= currentDate).map((lesson) => [lesson.id, lesson])).values()]
  const days: HealthDay[] = []
  let previousFinal = INITIAL_HEALTH
  for (let date = anchor; date <= currentDate; date = addDay(date)) {
    const baseHealth = days.length === 0 ? INITIAL_HEALTH : isVacationDay(date, vacationPeriods) ? previousFinal : Math.round(previousFinal * 0.8)
    const parentContribution = practicesById.filter((record) => record.date === date).reduce((sum, record) => sum + parentHealthContribution(record), 0)
    const teacherContribution = lessonsById.filter((lesson) => lesson.lessonDate === date).reduce((sum, lesson) => sum + [...new Map(lesson.itemEvaluations.map((item) => [item.homeworkItemId, item])).values()].reduce((itemSum, item) => itemSum + teacherItemHealthContribution(item), 0), 0)
    const finalHealth = clampHealth(baseHealth + parentContribution + teacherContribution)
    days.push({ date, baseHealth, parentContribution, teacherContribution, finalHealth })
    previousFinal = finalHealth
  }
  return { anchorDate: anchor, currentDate, currentHealth: previousFinal, days }
}
