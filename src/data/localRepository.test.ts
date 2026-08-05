import { describe, expect, it, vi } from 'vitest'
import { createDemoState, createLocalRepository, derivePracticeStats, STORAGE_KEY } from './localRepository'

class MemoryStorage {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

const practice = (date = '2026-08-20') => ({ date, minutes: 15, quality: 'focused' as const, achievements: ['assigned_section'], customAchievement: '', improvement: 'small' as const, parentNote: 'Careful practice.' })

describe('local repository persistence', () => {
  it('persists practice and derived tree state across repository reload', () => {
    const storage = new MemoryStorage()
    const first = createLocalRepository(storage)
    const before = first.getTreeState()
    const saved = first.savePracticeRecord(practice())
    const second = createLocalRepository(storage)
    expect(second.getPracticeRecords().some((record) => record.id === saved.record.id)).toBe(true)
    expect(second.getTreeState().leafCount).toBe(saved.treeState.leafCount)
    expect(second.getTreeState().totalPracticeMinutes).toBeGreaterThan(before.totalPracticeMinutes)
  })

  it('persists parent homework and one teacher lesson evaluation', () => {
    const storage = new MemoryStorage()
    const first = createLocalRepository(storage)
    first.resetDemoData()
    const homework = first.addHomeworkItem({ title: 'New étude', section: 'Page 4', instruction: 'Slowly' })
    const active = first.getHomeworkItems().filter((item) => item.status === 'active')
    first.saveLessonEvaluation(active.map((item) => ({ homeworkItemId: item.id, score: 80 as const, improvement: 'clear' as const, completed: item.id === homework.id })))
    const second = createLocalRepository(storage)
    expect(second.getHomeworkItems().find((item) => item.id === homework.id)?.status).toBe('completed')
    expect(second.getLessonEvaluations()).toHaveLength(1)
    expect(second.getLearningCycles()).toHaveLength(1)
  })

  it('does not replace an existing valid saved state with demo data', () => {
    const storage = new MemoryStorage()
    const saved = createDemoState()
    saved.childProfile.displayName = 'Saved child'
    saved.homeworkItems = []
    storage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const repository = createLocalRepository(storage)
    expect(repository.getChildProfile().displayName).toBe('Saved child')
    expect(repository.getHomeworkItems()).toEqual([])
  })

  it('recovers from invalid JSON without crashing and retains a backup', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEY, '{broken')
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const repository = createLocalRepository(storage)
    expect(repository.getTreeState().stage).toBe(1)
    expect(repository.getLoadWarning()).toMatch(/could not be loaded/i)
    expect([...storage.values.keys()].some((key) => key.startsWith(`${STORAGE_KEY}:invalid:`))).toBe(true)
    warning.mockRestore()
  })

  it('reports unavailable browser storage and gives mutations a safe user-facing error', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const unavailableStorage = {
      getItem: () => { throw new Error('SecurityError') },
      setItem: () => { throw new Error('QuotaExceededError') },
      removeItem: () => { throw new Error('SecurityError') },
    }
    const repository = createLocalRepository(unavailableStorage)
    expect(repository.getLoadWarning()).toMatch(/storage is unavailable/i)
    expect(() => repository.grantParentReward('A story', 'apple')).toThrow(/storage is unavailable/i)
    warning.mockRestore()
  })

  it('rejects an accidental duplicate practice submission', () => {
    const repository = createLocalRepository(new MemoryStorage())
    repository.savePracticeRecord(practice())
    expect(() => repository.savePracticeRecord(practice())).toThrow(/already been saved/i)
  })

  it('counts duplicate dates once and excludes zero-minute records from valid days', () => {
    const base = createDemoState().practiceRecords[0]
    const stats = derivePracticeStats([{ ...base, id: 'one', date: '2026-09-01', minutes: 5 }, { ...base, id: 'two', date: '2026-09-01', minutes: 20 }, { ...base, id: 'zero', date: '2026-09-02', minutes: 0 }])
    expect(stats.totalPracticeDays).toBe(1)
    expect(stats.totalPracticeMinutes).toBe(25)
  })

  it('does not persist developer preview UI state', () => {
    const storage = new MemoryStorage()
    createLocalRepository(storage)
    const raw = storage.getItem(STORAGE_KEY)!
    expect(raw).not.toContain('developerPreview')
    expect(raw).not.toContain('previewStage')
    expect(raw).not.toContain('selectedRole')
  })

  it('exports and restores a complete validated JSON backup', () => {
    const source = createLocalRepository(new MemoryStorage())
    const added = source.addHomeworkItem({ title: 'Backup piece', section: 'Bars 2–6', instruction: 'Gently' })
    const json = source.exportBackupJson()
    const target = createLocalRepository(new MemoryStorage())
    expect(target.validateBackupJson(json)).toBe(true)
    target.restoreBackupJson(json)
    expect(target.getHomeworkItems().some((item) => item.id === added.id)).toBe(true)
    expect(JSON.parse(json)).toMatchObject({ version: 1, childProfile: { id: 'child_001' } })
  })

  it('rejects an invalid backup before replacing current data', () => {
    const repository = createLocalRepository(new MemoryStorage())
    const before = repository.getHomeworkItems()
    expect(() => repository.restoreBackupJson('{"version":1}')).toThrow(/valid Music Tree/i)
    expect(repository.getHomeworkItems()).toEqual(before)
  })

  it('exports the requested practice CSV columns with escaped values', () => {
    const repository = createLocalRepository(new MemoryStorage())
    repository.savePracticeRecord({ ...practice('2026-09-01'), parentNote: 'Careful, steady' })
    const csv = repository.exportPracticeCsv()
    expect(csv.split('\r\n')[0]).toBe('date,minutes,quality,achievements,improvement,parent note')
    expect(csv).toContain('"Careful, steady"')
    expect(csv).toContain('"assigned_section"')
  })

  it('persists the parent-selected child name and built-in avatar', () => {
    const storage = new MemoryStorage()
    const first = createLocalRepository(storage)
    first.updateChildProfile({ displayName: 'Mia', avatarId: 'rainbow_unicorn' })
    const second = createLocalRepository(storage)
    expect(second.getChildProfile()).toEqual({ id: 'child_001', displayName: 'Mia', avatarId: 'rainbow_unicorn' })
  })

  it('migrates a saved legacy avatar choice to a stable avatar ID', () => {
    const storage = new MemoryStorage()
    const saved = createDemoState() as unknown as { childProfile: Record<string, unknown> }
    saved.childProfile = { id: 'child_001', displayName: 'Lucy', avatarChoice: 'rescue-puppy' }
    storage.setItem(STORAGE_KEY, JSON.stringify(saved))
    expect(createLocalRepository(storage).getChildProfile().avatarId).toBe('rescue_puppy')
  })

  it('creates one permanent completed piece and fruit only for completed piece homework', () => {
    const storage = new MemoryStorage()
    const saved = createDemoState()
    saved.homeworkItems = []
    saved.completedPieces = []
    saved.treeState.completedPieces = []
    saved.treeState.fruitCount = 0
    storage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const repository = createLocalRepository(storage)
    const piece = repository.addHomeworkItem({ title: 'Moonlight Song', type: 'piece' })
    const scale = repository.addHomeworkItem({ title: 'C scale', type: 'scale' })
    const rhythm = repository.addHomeworkItem({ title: 'Page 8', type: 'rhythm' })
    const technique = repository.addHomeworkItem({ title: 'Finger pattern', type: 'technique' })
    const other = repository.addHomeworkItem({ title: 'Listening task', type: 'other' })
    repository.saveLessonEvaluation([piece, scale, rhythm, technique, other].map((item) => ({ homeworkItemId: item.id, score: 80 as const, improvement: 'clear' as const, completed: true })))
    expect(repository.getCompletedPieces()).toHaveLength(1)
    expect(repository.getCompletedPieces()[0]).toMatchObject({ pieceName: 'Moonlight Song', homeworkItemId: piece.id })
    expect(repository.getTreeState().fruitCount).toBe(1)
  })

  it('does not create a completed piece for an incomplete piece', () => {
    const storage = new MemoryStorage()
    const saved = createDemoState()
    saved.homeworkItems = []
    saved.completedPieces = []
    saved.treeState.completedPieces = []
    saved.treeState.fruitCount = 0
    storage.setItem(STORAGE_KEY, JSON.stringify(saved))
    const repository = createLocalRepository(storage)
    const piece = repository.addHomeworkItem({ title: 'Still learning', type: 'piece' })
    repository.saveLessonEvaluation([{ homeworkItemId: piece.id, score: 60, improvement: 'small', completed: false }])
    expect(repository.getCompletedPieces()).toHaveLength(0)
  })

  it('rejects duplicate lesson submission before duplicating cycles, pieces, or fruits', () => {
    const repository = createLocalRepository(new MemoryStorage())
    const piece = repository.addHomeworkItem({ title: 'Unique piece', type: 'piece' })
    const active = repository.getHomeworkItems().filter((item) => item.status === 'active')
    const evaluations = active.map((item) => ({ homeworkItemId: item.id, score: 80 as const, improvement: 'clear' as const, completed: item.id === piece.id }))
    repository.saveLessonEvaluation(evaluations)
    const counts = { lessons: repository.getLessonEvaluations().length, cycles: repository.getLearningCycles().length, pieces: repository.getCompletedPieces().length, fruits: repository.getTreeState().fruitCount }
    expect(() => repository.saveLessonEvaluation(evaluations)).toThrow(/already been saved/i)
    expect({ lessons: repository.getLessonEvaluations().length, cycles: repository.getLearningCycles().length, pieces: repository.getCompletedPieces().length, fruits: repository.getTreeState().fruitCount }).toEqual(counts)
  })

  it('preserves completed-piece fruit linkage through reload and JSON restore', () => {
    const storage = new MemoryStorage()
    const repository = createLocalRepository(storage)
    const piece = repository.addHomeworkItem({ title: 'Persistent piece', type: 'piece' })
    const active = repository.getHomeworkItems().filter((item) => item.status === 'active')
    repository.saveLessonEvaluation(active.map((item) => ({ homeworkItemId: item.id, score: 100 as const, improvement: 'big' as const, completed: item.id === piece.id })))
    const reloaded = createLocalRepository(storage)
    expect(reloaded.getCompletedPieces().some((item) => item.homeworkItemId === piece.id)).toBe(true)
    expect(reloaded.getTreeState().fruitCount).toBe(reloaded.getCompletedPieces().length)
    const restored = createLocalRepository(new MemoryStorage())
    restored.restoreBackupJson(reloaded.exportBackupJson())
    expect(restored.getCompletedPieces()).toEqual(reloaded.getCompletedPieces())
    expect(restored.getTreeState().fruitCount).toBe(reloaded.getTreeState().fruitCount)
  })

  it('loads old homework without a type as other without title inference', () => {
    const storage = new MemoryStorage()
    const saved = createDemoState() as unknown as { homeworkItems: Array<Record<string, unknown>> }
    saved.homeworkItems = [{ id: 'legacy_piece_title', childId: 'child_001', title: 'Looks like a song', status: 'active', createdAt: '2026-08-01' }]
    storage.setItem(STORAGE_KEY, JSON.stringify(saved))
    expect(createLocalRepository(storage).getHomeworkItems()[0].type).toBe('other')
  })

  it('safely deletes only active homework with no historical references', () => {
    const storage = new MemoryStorage()
    const repository = createLocalRepository(storage)
    const stageBefore = repository.getTreeState().stage
    const historyBefore = repository.getLessonEvaluations()
    const item = repository.addHomeworkItem({ title: 'Added by mistake', type: 'scale' })
    expect(repository.canRemoveHomeworkItem(item.id)).toBe(true)
    expect(repository.removeHomeworkItem(item.id)).toEqual({ status: 'deleted' })
    expect(repository.getTreeState().stage).toBe(stageBefore)
    expect(repository.getLessonEvaluations()).toEqual(historyBefore)
    expect(createLocalRepository(storage).getHomeworkItems().some((value) => value.id === item.id)).toBe(false)
  })

  it('blocks deletion after homework becomes part of lesson and cycle history', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-01T12:00:00.000Z'))
    try {
      const storage = new MemoryStorage()
      const saved = createDemoState()
      saved.homeworkItems = []
      saved.lessonEvaluations = []
      saved.learningCycles = []
      saved.completedPieces = []
      storage.setItem(STORAGE_KEY, JSON.stringify(saved))
      const repository = createLocalRepository(storage)
      const evaluated = repository.addHomeworkItem({ title: 'Historical scale', type: 'scale' })
      repository.saveLessonEvaluation([{ homeworkItemId: evaluated.id, score: 80, improvement: 'clear', completed: false }])
      expect(repository.canRemoveHomeworkItem(evaluated.id)).toBe(false)
      expect(repository.removeHomeworkItem(evaluated.id)).toEqual({ status: 'blocked_historical_reference' })
      expect(repository.getHomeworkItems().some((item) => item.id === evaluated.id)).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not create earned-leaf reminders from the legacy mutable tree field', () => {
    const storage = new MemoryStorage()
    const repository = createLocalRepository(storage)
    const baseline = repository.getTreeState()
    const unchanged = { water: baseline.waterBalance, health: baseline.treeHealth, root: baseline.rootStrength, stage: baseline.stage }

    repository.saveTreeState({ ...baseline, leafCount: 5 })
    expect(repository.getRewardReminders()).toHaveLength(0)
    expect(repository.getTreeState()).toMatchObject({ waterBalance: unchanged.water, treeHealth: unchanged.health, rootStrength: unchanged.root, stage: unchanged.stage })
  })

  it('handles grant and skip while leaving remind-later pending', () => {
    const storage = new MemoryStorage()
    const state = createDemoState()
    state.rewardReminders = [{ id: 'five', childId: state.childProfile.id, leafMilestone: 5, status: 'pending', createdAt: '2026-08-01' }, { id: 'ten', childId: state.childProfile.id, leafMilestone: 10, status: 'pending', createdAt: '2026-08-02' }]
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    const repository = createLocalRepository(storage)
    const five = repository.getRewardReminders()[0]
    expect(five.status).toBe('pending')
    expect(repository.getRewardReminders()[0].status).toBe('pending')
    expect(repository.handleRewardReminder(five.id, 'granted')).toMatchObject({ status: 'granted', leafMilestone: 5 })

    const ten = repository.getRewardReminders().find((item) => item.leafMilestone === 10)!
    expect(repository.handleRewardReminder(ten.id, 'skipped')).toMatchObject({ status: 'skipped', leafMilestone: 10 })
    expect(repository.getRewardReminders()).toHaveLength(2)
  })

  it('persists, edits, and cancels a future Urlaub period without changing tree state', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T12:00:00.000Z'))
    try {
      const storage = new MemoryStorage()
      const repository = createLocalRepository(storage)
      const treeBefore = repository.getTreeState()
      const saved = repository.addVacationPeriod({ startDate: '2026-08-10', endDate: '2026-08-12', note: 'Family trip' })
      expect(() => repository.addVacationPeriod({ startDate: '2026-08-10', endDate: '2026-08-12' })).toThrow(/already been saved/)
      repository.updateVacationPeriod(saved.id, { startDate: '2026-08-11', endDate: '2026-08-13', note: 'Updated trip' })
      expect(createLocalRepository(storage).getVacationPeriods()[0]).toMatchObject({ startDate: '2026-08-11', endDate: '2026-08-13', note: 'Updated trip' })
      expect(repository.cancelVacationPeriod(saved.id)?.cancelledAt).toBeTruthy()
      expect(repository.getTreeState()).toEqual(treeBefore)
    } finally {
      vi.useRealTimers()
    }
  })

  it('ends an active Urlaub early and includes it in backup restore', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T12:00:00.000Z'))
    try {
      const repository = createLocalRepository(new MemoryStorage())
      const active = repository.addVacationPeriod({ startDate: '2026-08-01', endDate: '2026-08-10', note: '' })
      expect(repository.endVacationPeriodEarly(active.id)?.endedEarlyAt).toBe('2026-08-04T12:00:00.000Z')
      const restored = createLocalRepository(new MemoryStorage())
      restored.restoreBackupJson(repository.exportBackupJson())
      expect(restored.getVacationPeriods()).toEqual(repository.getVacationPeriods())
    } finally {
      vi.useRealTimers()
    }
  })

  it('allows optional practice to be saved during an active Urlaub', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T12:00:00.000Z'))
    try {
      const repository = createLocalRepository(new MemoryStorage())
      repository.addVacationPeriod({ startDate: '2026-08-01', endDate: '2026-08-10' })
      const saved = repository.savePracticeRecord(practice('2026-08-04'))
      expect(repository.getPracticeRecords().some((record) => record.id === saved.record.id)).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('awards permanent Root categories once and creates pieces only from piece homework', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-04T12:00:00.000Z'))
    try {
      const storage = new MemoryStorage()
      const repository = createLocalRepository(storage)
      repository.resetDemoData()
      const rootBefore = repository.getTreeState().rootStrength
      const piecesBefore = repository.getCompletedPieces().length
      const active = repository.getHomeworkItems().filter((item) => item.status === 'active')
      repository.saveLessonEvaluation(active.map((item) => ({ homeworkItemId: item.id, score: 80 as const, improvement: 'big' as const, completed: true })))
      expect(repository.getTreeState().rootStrength).toBe(rootBefore + 3)
      expect(repository.getRootAwards()).toHaveLength(1)
      expect(repository.getRootAwards()[0]).toMatchObject({ completedCycle: true, completedPieceCategory: true, bigImprovement: true, points: 3 })
      expect(repository.getCompletedPieces()).toHaveLength(piecesBefore + active.filter((item) => item.type === 'piece').length)
      expect(repository.getTreeState().fruitCount).toBe(repository.getCompletedPieces().length)

      const reloaded = createLocalRepository(storage)
      expect(reloaded.getTreeState().rootStrength).toBe(rootBefore + 3)
      expect(reloaded.getRootAwards()).toHaveLength(1)
      expect(() => reloaded.saveLessonEvaluation([])).toThrow(/already been saved/)
    } finally {
      vi.useRealTimers()
    }
  })
})
