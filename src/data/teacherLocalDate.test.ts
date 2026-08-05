import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLocalRepository } from './localRepository'

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

const saveTeacherLesson = (instant: string, expectedDate: string) => {
  vi.setSystemTime(instant)
  const storage = new MemoryStorage()
  const repository = createLocalRepository(storage, 'Europe/Berlin')
  const homework = repository.addHomeworkItem({ title: 'Moonlight Song', type: 'piece' })
  repository.savePracticeRecord({ date: expectedDate, minutes: 10, quality: 'focused', achievements: ['rhythm_improved'], customAchievement: '', improvement: 'clear', parentNote: '' })
  const lesson = repository.saveLessonEvaluation([{ homeworkItemId: homework.id, score: 80, improvement: 'big', completed: true }])
  return { repository, storage, homework, lesson }
}

afterEach(() => vi.useRealTimers())

describe('Teacher local calendar date', () => {
  it('uses the Berlin summer date consistently across every Teacher-derived record and replay', () => {
    vi.useFakeTimers()
    const { repository, storage, homework, lesson } = saveTeacherLesson('2026-08-04T22:30:00.000Z', '2026-08-05')
    expect(lesson.lessonDate).toBe('2026-08-05')
    expect(repository.getCompletedPieces()[0]).toMatchObject({ homeworkItemId: homework.id, completionDate: '2026-08-05' })
    expect(repository.getLearningCycles()[0]).toMatchObject({ teacherLessonEvaluationId: lesson.id, completedAt: '2026-08-05' })
    expect(repository.getRootAwards()[0]).toMatchObject({ lessonEvaluationId: lesson.id, createdAt: '2026-08-05' })
    expect(repository.getHealthReplay('2026-08-05').days.at(-1)?.teacherContribution).toBeGreaterThan(0)
    expect(Object.fromEntries(repository.getCurrentStageProgression().requirements.map((item) => [item.id, item.actual]))).toMatchObject({
      'learning-cycles': 1,
      'qualified-lessons': 1,
      'completed-pieces': 1,
    })
    expect(() => repository.saveLessonEvaluation([{ homeworkItemId: homework.id, score: 80, improvement: 'big', completed: true }])).toThrow('already been saved')

    const reloaded = createLocalRepository(storage, 'Europe/Berlin')
    expect(reloaded.getLessonEvaluations()[0].lessonDate).toBe('2026-08-05')
    expect(reloaded.getLearningCycles()[0].completedAt).toBe('2026-08-05')
    const imported = createLocalRepository(new MemoryStorage(), 'Europe/Berlin')
    imported.restoreBackupJson(repository.exportBackupJson())
    expect(imported.getLessonEvaluations()[0].lessonDate).toBe('2026-08-05')
    expect(imported.getCompletedPieces()[0].completionDate).toBe('2026-08-05')
  })

  it.each([
    ['winter midnight rollover', '2026-01-01T23:30:00.000Z', '2026-01-02'],
    ['ordinary daytime', '2026-08-04T12:00:00.000Z', '2026-08-04'],
  ])('handles %s without UTC truncation', (_name, instant, expectedDate) => {
    vi.useFakeTimers()
    const { lesson } = saveTeacherLesson(instant, expectedDate)
    expect(lesson.lessonDate).toBe(expectedDate)
  })
})
