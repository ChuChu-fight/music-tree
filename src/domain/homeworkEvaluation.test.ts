import { describe, expect, it } from 'vitest'
import { createLessonEvaluation, starRatingToPercentage, validateHomeworkItem, validateItemEvaluations } from './homeworkEvaluation'
import type { HomeworkItem, HomeworkItemEvaluation } from './types'
import { localRepository } from '../data/localRepository'

const items: HomeworkItem[] = [
  { id: 'one', childId: 'child_001', title: 'Little Snow Waltz', type: 'piece', section: 'Bars 1–16', instruction: 'Practise slowly', status: 'active', createdAt: '2026-08-01' },
  { id: 'two', childId: 'child_001', title: 'C major scale', type: 'scale', status: 'active', createdAt: '2026-08-01' },
]
const evaluations: HomeworkItemEvaluation[] = [
  { homeworkItemId: 'one', score: 80, improvement: 'clear', completed: false },
  { homeworkItemId: 'two', score: 100, improvement: 'big', completed: true },
]

describe('homework item lesson evaluation', () => {
  it('converts the fourth star to the stored 80% quality value', () => expect(starRatingToPercentage(4)).toBe(80))
  it('preserves one result for every active homework item', () => {
    const result = createLessonEvaluation({ childId: 'child_001', activeItems: items, itemEvaluations: evaluations, now: '2026-08-08T12:00:00.000Z', lessonDate: '2026-08-08', id: 'lesson_1' })
    expect(result.lessonDate).toBe('2026-08-08')
    expect(result.itemEvaluations).toEqual(evaluations)
  })

  it('rejects missing, duplicate, or invalid item evaluations', () => {
    expect(validateItemEvaluations(items, evaluations.slice(0, 1))).toMatch(/every active/i)
    expect(validateItemEvaluations(items, [evaluations[0], evaluations[0]])).toMatch(/only once/i)
    expect(validateItemEvaluations(items, [{ ...evaluations[0], score: 75 as 80 }, evaluations[1]])).toMatch(/five preparation/i)
  })

  it('validates fixed improvement choices and parent homework titles', () => {
    expect(validateItemEvaluations(items, [{ ...evaluations[0], improvement: 'other' as 'small' }, evaluations[1]])).toMatch(/improvement/i)
    expect(validateHomeworkItem({ title: ' ', section: '', instruction: '' })).toMatch(/piece or exercise/i)
  })

  it('moves completed items to history, preserves unfinished text, and rejects a duplicate save', () => {
    localRepository.resetDemoData()
    const active = localRepository.getHomeworkItems().filter((item) => item.status === 'active')
    const originalText = active.map((item) => ({ id: item.id, title: item.title, section: item.section, instruction: item.instruction }))
    const results = active.map((item, index): HomeworkItemEvaluation => ({ homeworkItemId: item.id, score: 80, improvement: 'clear', completed: index === 0 }))

    localRepository.saveLessonEvaluation(results)
    const afterSave = localRepository.getHomeworkItems()

    expect(afterSave.find((item) => item.id === active[0].id)?.status).toBe('completed')
    expect(afterSave.filter((item) => item.status === 'active')).toHaveLength(active.length - 1)
    expect(afterSave.map((item) => ({ id: item.id, title: item.title, section: item.section, instruction: item.instruction }))).toEqual(originalText)
    expect(localRepository.getLessonEvaluations()).toHaveLength(1)
    expect(() => localRepository.saveLessonEvaluation(results.slice(1))).toThrow(/already been saved/)
    expect(localRepository.getLessonEvaluations()).toHaveLength(1)
  })
})
