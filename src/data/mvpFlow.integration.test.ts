import { describe, expect, it, vi } from 'vitest'
import { evaluateStageProgression } from '../domain/stageProgressionEngine'
import { createInitialTreeState } from '../domain/treeGrowthEngine'
import { buildDevelopmentScenarioResults } from '../domain/developmentScenarios'
import { createDemoState, createLocalRepository, STORAGE_KEY } from './localRepository'

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

const cleanStorage = () => {
  const storage = new MemoryStorage()
  const state = createDemoState()
  state.practiceRecords = []
  state.homeworkItems = []
  state.lessonEvaluations = []
  state.learningCycles = []
  state.completedPieces = []
  state.stageEntrySnapshots = []
  state.specialFruits = []
  state.treeState = createInitialTreeState()
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
  return storage
}

describe('complete persisted MVP learning flow', () => {
  it('keeps parent, practice, teacher, piece, fruit, and progression state through reload and restore', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-03T12:00:00.000Z'))
    try {
      const storage = cleanStorage()
      const repository = createLocalRepository(storage)
      const piece = repository.addHomeworkItem({ title: 'Little Snow Waltz', type: 'piece', section: 'Bars 1-16' })
      const scale = repository.addHomeworkItem({ title: 'C major scale', type: 'scale' })
      const rhythm = repository.addHomeworkItem({ title: 'Rhythm exercise', type: 'rhythm', section: 'Page 8' })

      repository.savePracticeRecord({ date: '2026-08-01', minutes: 15, quality: 'normal', achievements: ['assigned_section'], customAchievement: '', improvement: 'small', parentNote: '' })
      repository.savePracticeRecord({ date: '2026-08-02', minutes: 20, quality: 'focused', achievements: ['rhythm_improved'], customAchievement: '', improvement: 'clear', parentNote: 'Steadier.' })
      repository.savePracticeRecord({ date: '2026-08-03', minutes: 10, quality: 'difficult', achievements: [], customAchievement: '', improvement: 'small', parentNote: '' })

      repository.saveLessonEvaluation([
        { homeworkItemId: piece.id, score: 80, improvement: 'clear', completed: true },
        { homeworkItemId: scale.id, score: 60, improvement: 'small', completed: true },
        { homeworkItemId: rhythm.id, score: 100, improvement: 'big', completed: true },
      ])

      expect(repository.getLessonEvaluations()).toHaveLength(1)
      expect(repository.getLearningCycles()).toHaveLength(1)
      expect(repository.getCompletedPieces()).toHaveLength(1)
      expect(repository.getCompletedPieces()[0].homeworkItemId).toBe(piece.id)
      expect(repository.getTreeState()).toMatchObject({ stage: 1, fruitCount: 1 })
      expect(repository.recalculateTreeStateFromHistory()).toMatchObject({ stage: 1, fruitCount: 1 })
      expect(repository.applyCurrentStageProgression().result).toMatchObject({ status: 'configured', eligibleForNextStage: false })

      const reloaded = createLocalRepository(storage)
      expect(reloaded.getHomeworkItems()).toHaveLength(3)
      expect(reloaded.getPracticeRecords()).toHaveLength(3)
      expect(reloaded.getLessonEvaluations()).toHaveLength(1)
      expect(reloaded.getLearningCycles()).toHaveLength(1)
      expect(reloaded.getCompletedPieces()).toHaveLength(1)
      expect(reloaded.getTreeState()).toMatchObject({ stage: 1, fruitCount: 1 })

      const backup = reloaded.exportBackupJson()
      expect(backup).not.toContain('developerPreview')
      for (const scenario of buildDevelopmentScenarioResults()) expect(backup).not.toContain(scenario.scenario)
      const restored = createLocalRepository(cleanStorage())
      restored.restoreBackupJson(backup)
      expect(restored.getHomeworkItems()).toEqual(reloaded.getHomeworkItems())
      expect(restored.getPracticeRecords()).toEqual(reloaded.getPracticeRecords())
      expect(restored.getLessonEvaluations()).toEqual(reloaded.getLessonEvaluations())
      expect(restored.getLearningCycles()).toEqual(reloaded.getLearningCycles())
      expect(restored.getCompletedPieces()).toEqual(reloaded.getCompletedPieces())
      expect(restored.getTreeState()).toEqual(reloaded.getTreeState())
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects invalid backups and keeps Stage 4 to 5 configured but locked without evidence', () => {
    const repository = createLocalRepository(cleanStorage())
    expect(() => repository.restoreBackupJson('{"version":1}')).toThrow(/not a valid Music Tree/i)
    expect(evaluateStageProgression({ currentStage: 4, stageEntryDate: '2026-01-01', currentDate: '2026-12-31', practiceRecords: [], learningCycles: [], lessonEvaluations: [], completedPieces: [], concertRecords: [] })).toMatchObject({ status: 'configured', nextStage: 5, eligibleForNextStage: false })
  })
})
