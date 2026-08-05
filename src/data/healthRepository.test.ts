import { describe, expect, it, vi } from 'vitest'
import { createDemoState, createLocalRepository, STORAGE_KEY } from './localRepository'

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

const practice = (note: string) => ({ date: '2026-10-04', minutes: 10, quality: 'normal' as const, achievements: [], customAchievement: '', improvement: 'none' as const, parentNote: note })
const emptyStorage = () => { const storage = new MemoryStorage(); const state = createDemoState(); state.practiceRecords = []; state.lessonEvaluations = []; storage.setItem(STORAGE_KEY, JSON.stringify(state)); return storage }

describe('repository Health integration', () => {
  it('updates derived Health immediately and reload/rerender reads do not repeat decay', () => {
    const storage = emptyStorage()
    const repository = createLocalRepository(storage)
    repository.savePracticeRecord(practice('one'))
    const first = repository.getCurrentHealth('2026-10-04')
    expect(first).toBe(90)
    expect(repository.getCurrentHealth('2026-10-04')).toBe(first)
    expect(createLocalRepository(storage).getCurrentHealth('2026-10-04')).toBe(first)
  })

  it('a rejected fourth PracticeRecord contributes no Health', () => {
    const repository = createLocalRepository(new MemoryStorage())
    repository.savePracticeRecord(practice('one'))
    repository.savePracticeRecord(practice('two'))
    repository.savePracticeRecord(practice('three'))
    const before = repository.getCurrentHealth('2026-10-04')
    expect(() => repository.savePracticeRecord(practice('four'))).toThrow(/three practice moments/i)
    expect(repository.getCurrentHealth('2026-10-04')).toBe(before)
  })

  it('Teacher contributions are derived once from the persisted lesson', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T12:00:00.000Z'))
    try {
      const repository = createLocalRepository(new MemoryStorage())
      repository.resetDemoData()
      const active = repository.getHomeworkItems().filter((homework) => homework.status === 'active')
      repository.saveLessonEvaluation(active.map((homework, index) => ({ homeworkItemId: homework.id, score: index === 0 ? 100 as const : 60 as const, improvement: index === 0 ? 'big' as const : 'small' as const, completed: index === 0 })))
      const first = repository.getCurrentHealth('2026-08-04')
      expect(first).toBe(100)
      expect(repository.getCurrentHealth('2026-08-04')).toBe(first)
      expect(() => repository.saveLessonEvaluation([])).toThrow(/already been saved/i)
      expect(repository.getCurrentHealth('2026-08-04')).toBe(first)
    } finally { vi.useRealTimers() }
  })

  it('export/import preserves evidence and reproduces Health', () => {
    const source = createLocalRepository(new MemoryStorage())
    source.savePracticeRecord(practice('exported'))
    const restored = createLocalRepository(new MemoryStorage())
    restored.restoreBackupJson(source.exportBackupJson())
    expect(restored.getCurrentHealth('2026-10-05')).toBe(source.getCurrentHealth('2026-10-05'))
    expect(restored.getHealthReplay('2026-10-05')).toEqual(source.getHealthReplay('2026-10-05'))
  })

  it('ignores but preserves the legacy mutable Health field during migration', () => {
    const storage = new MemoryStorage()
    const state = createDemoState()
    state.practiceRecords = []
    state.lessonEvaluations = []
    state.treeState.treeHealth = 17
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    const repository = createLocalRepository(storage)
    expect(repository.getCurrentHealth('2026-10-04')).toBe(80)
    expect(repository.getTreeState().treeHealth).toBe(17)
    repository.recalculateTreeStateFromHistory()
    expect(repository.getTreeState().treeHealth).toBe(17)
  })

  it('replays Urlaub-aware Health equivalently after reload and import', () => {
    const storage = emptyStorage()
    const state = JSON.parse(storage.getItem(STORAGE_KEY)!)
    state.practiceRecords = [{ id: 'practice', childId: 'child_001', date: '2026-10-01', minutes: 20, quality: 'focused', achievements: ['assigned_section'], customAchievement: '', improvement: 'none', parentNote: '', createdAt: '2026-10-01T10:00:00.000Z', updatedAt: '2026-10-01T10:00:00.000Z' }]
    state.vacationPeriods = [{ id: 'vacation', childId: 'child_001', startDate: '2026-10-02', endDate: '2026-10-04', createdAt: '2026-10-01T12:00:00.000Z' }]
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    const repository = createLocalRepository(storage)
    expect(repository.getHealthReplay('2026-10-05').days.map((day) => day.finalHealth)).toEqual([100, 100, 100, 100, 80])
    expect(createLocalRepository(storage).getHealthReplay('2026-10-05')).toEqual(repository.getHealthReplay('2026-10-05'))
    const restored = createLocalRepository(new MemoryStorage())
    restored.restoreBackupJson(repository.exportBackupJson())
    expect(restored.getHealthReplay('2026-10-05')).toEqual(repository.getHealthReplay('2026-10-05'))
  })

  it('creates no growth evidence from Urlaub alone', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T12:00:00.000Z'))
    try {
      const repository = createLocalRepository(new MemoryStorage())
      const before = { tree: repository.getTreeState(), practice: repository.getPracticeRecords(), cycles: repository.getLearningCycles(), pieces: repository.getCompletedPieces(), root: repository.getRootAwards(), rewards: repository.getParentRewards(), reminders: repository.getRewardReminders() }
      repository.addVacationPeriod({ startDate: '2026-08-04', endDate: '2026-08-06', note: 'Resting' })
      expect({ tree: repository.getTreeState(), practice: repository.getPracticeRecords(), cycles: repository.getLearningCycles(), pieces: repository.getCompletedPieces(), root: repository.getRootAwards(), rewards: repository.getParentRewards(), reminders: repository.getRewardReminders() }).toEqual(before)
    } finally { vi.useRealTimers() }
  })
})
