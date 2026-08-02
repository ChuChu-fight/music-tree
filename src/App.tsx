import { useMemo, useState } from 'react'
import './App.css'
import { MusicTree } from './components/tree/MusicTree'
import { localRepository } from './data/localRepository'
import { calculatePracticeGrowth, createInitialTreeState } from './domain/treeGrowthEngine'
import { getPermissionsForRole, MVP_ROLE_NOTE } from './domain/permissions'
import { chooseRandomReward, type FamilyReward, type SpecialFruit } from './domain/specialFruitEngine'
import { TREE_STAGE_BLUEPRINTS, type TreeStage } from './domain/treeStageBlueprints'
import type { AppRole, PracticeRecord, TreeState } from './domain/types'

const initialRole: AppRole = 'parent'

const roleLabel: Record<AppRole, string> = {
  child: 'Child',
  parent: 'Parent',
  teacher: 'Teacher',
}

const defaultRewardName = 'Choose the family movie'

function App() {
  const [role, setRole] = useState<AppRole>(initialRole)
  const [treeState, setTreeState] = useState<TreeState>(() => ({
    ...createInitialTreeState(),
    ...localRepository.getTreeState(),
  }))
  const [records, setRecords] = useState<PracticeRecord[]>(() => localRepository.getPracticeRecords())
  const [message, setMessage] = useState<string>(localRepository.getTreeState().message)
  const [minutes, setMinutes] = useState<number>(15)
  const [quality, setQuality] = useState<PracticeRecord['quality']>('good')
  const [achievement, setAchievement] = useState<string>('assigned_section')
  const [improvement, setImprovement] = useState<PracticeRecord['improvement']>('small')
  const [note, setNote] = useState('')
  const [rewards, setRewards] = useState<FamilyReward[]>(() => localRepository.getRewards())
  const [rewardName, setRewardName] = useState('')
  const [fruitHistory, setFruitHistory] = useState<SpecialFruit[]>(() => localRepository.getSpecialFruits())
  const [openedRewardName, setOpenedRewardName] = useState<string | null>(null)
  const [developerPreviewEnabled, setDeveloperPreviewEnabled] = useState(true)
  const [previewStage, setPreviewStage] = useState<TreeStage>(1)

  const permissions = useMemo(() => getPermissionsForRole(role), [role])
  const effectiveStage = developerPreviewEnabled ? previewStage : (treeState.stage as TreeStage)

  const handleSubmitPractice = () => {
    const record: PracticeRecord = {
      id: `practice_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      minutes,
      quality,
      achievements: [achievement],
      customAchievement: '',
      improvement,
      parentNote: note,
    }

    const result = calculatePracticeGrowth(treeState, record)
    setRecords((existing) => [record, ...existing])
    setTreeState(result.updatedState)
    setMessage(result.message)
    localRepository.saveTreeState(result.updatedState)
    localRepository.addPracticeRecord(record)
  }

  const addReward = () => {
    const trimmedName = rewardName.trim()
    if (!trimmedName) return

    const nextReward: FamilyReward = {
      id: `reward_${Date.now()}`,
      name: trimmedName,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const nextRewards = [nextReward, ...rewards]
    setRewards(nextRewards)
    localRepository.saveRewards(nextRewards)
    setRewardName('')
  }

  const toggleReward = (rewardId: string) => {
    const nextRewards = rewards.map((reward) =>
      reward.id === rewardId ? { ...reward, active: !reward.active, updatedAt: new Date().toISOString() } : reward,
    )
    setRewards(nextRewards)
    localRepository.saveRewards(nextRewards)
  }

  const deleteReward = (rewardId: string) => {
    const nextRewards = rewards.filter((reward) => reward.id !== rewardId)
    setRewards(nextRewards)
    localRepository.saveRewards(nextRewards)
  }

  const openFruit = () => {
    const activeRewards = rewards.filter((reward) => reward.active)
    if (activeRewards.length === 0) {
      setOpenedRewardName('Add or activate at least one family reward before opening the special fruit.')
      return
    }

    const selectedReward = chooseRandomReward(rewards)
    if (!selectedReward) {
      setOpenedRewardName('Add or activate at least one family reward before opening the special fruit.')
      return
    }

    const fruit: SpecialFruit = {
      id: `fruit_${Date.now()}`,
      childId: 'child_001',
      unlockReason: 'practice_and_pieces',
      sourceEventIds: ['manual_draw'],
      selectedRewardId: selectedReward.id,
      selectedRewardName: selectedReward.name,
      status: 'opened',
      unlockedAt: new Date().toISOString(),
      openedAt: new Date().toISOString(),
    }

    const nextFruits = [fruit, ...fruitHistory]
    setFruitHistory(nextFruits)
    localRepository.saveSpecialFruits(nextFruits)
    setOpenedRewardName(`Your surprise is: ${selectedReward.name}!`)
    setMessage('A magical fruit has grown! Tap it to discover your surprise.')
  }

  const roleOptions = (Object.keys(roleLabel) as AppRole[]).map((item) => ({
    value: item,
    label: roleLabel[item],
  }))

  const activeFruitReward = fruitHistory[0]?.selectedRewardName ?? defaultRewardName

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Music Tree</p>
          <h1>Magical winter practice</h1>
        </div>
        <div className="role-switcher" aria-label="Role selector">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={role === option.value ? 'pill active' : 'pill'}
              onClick={() => setRole(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <main className="layout">
        <section className="tree-panel">
          <div className="tree-header">
            <span className="badge">{roleLabel[role]} view</span>
            <strong>{message}</strong>
          </div>

          <div className="developer-preview">
            <label className="preview-toggle">
              <input type="checkbox" checked={developerPreviewEnabled} onChange={(event) => setDeveloperPreviewEnabled(event.target.checked)} />
              Developer preview
            </label>
            {developerPreviewEnabled && (
              <div className="stage-preview-controls" aria-label="Stage preview selector">
                {([1, 2, 3, 4, 5] as TreeStage[]).map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    className={previewStage === stage ? 'stage-preview active' : 'stage-preview'}
                    onClick={() => setPreviewStage(stage)}
                  >
                    Stage {stage}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="tree-fruit-button" onClick={openFruit} aria-label="Open special fruit mystery reward">
            <MusicTree treeState={treeState} stage={effectiveStage} developerPreview={developerPreviewEnabled} />
          </button>
          <div className="tree-stats">
            <span>Stage {effectiveStage}</span>
            <span>{TREE_STAGE_BLUEPRINTS[effectiveStage].name}</span>
            <span>Leaves {treeState.leafCount}</span>
            <span>Flowers {treeState.flowerCount}</span>
            <span>Glow {treeState.glowLevel}</span>
          </div>
        </section>

        <aside className="info-panel">
          <div className="card">
            <h2>Current homework</h2>
            <p>Little Snow Waltz · Bars 1–16</p>
            <p>Focus: steady rhythm</p>
          </div>

          <div className="card">
            <h2>Today’s tree status</h2>
            <ul>
              <li>Water: {treeState.waterBalance}/3</li>
              <li>Roots: {treeState.rootStrength}</li>
              <li>Health: {treeState.treeHealth}%</li>
            </ul>
          </div>

          {permissions.canRecordPractice && (
            <div className="card form-card">
              <h2>Daily practice</h2>
              <label>
                Practice minutes
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={minutes}
                  onChange={(event) => setMinutes(Number(event.target.value))}
                />
              </label>
              <label>
                Quality
                <select value={quality} onChange={(event) => setQuality(event.target.value as PracticeRecord['quality'])}>
                  <option value="low">Difficult to focus</option>
                  <option value="normal">Practised normally</option>
                  <option value="good">Focused and careful</option>
                </select>
              </label>
              <label>
                Achievement
                <select value={achievement} onChange={(event) => setAchievement(event.target.value)}>
                  <option value="assigned_section">Practised the assigned section</option>
                  <option value="completed_today_task">Completed today’s task</option>
                  <option value="played_difficult_section">Played a difficult section correctly</option>
                  <option value="played_whole_piece">Played the whole piece</option>
                  <option value="remembered_notes_independently">Remembered notes independently</option>
                  <option value="improved_rhythm">Improved the rhythm</option>
                  <option value="tried_without_help">Tried without help</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                Improvement
                <select value={improvement} onChange={(event) => setImprovement(event.target.value as PracticeRecord['improvement'])}>
                  <option value="none">Not visible yet</option>
                  <option value="small">A little better</option>
                  <option value="clear">Clearly better</option>
                  <option value="breakthrough">Breakthrough today</option>
                </select>
              </label>
              <label>
                Parent note
                <textarea
                  value={note}
                  maxLength={300}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                />
              </label>
              <button type="button" className="primary-button" onClick={handleSubmitPractice}>
                Save practice
              </button>
            </div>
          )}

          <div className="card">
            <h2>Reward progress</h2>
            <p>Practice days: 4 of 6</p>
            <p>Completed pieces: 1 of 2</p>
            <p>Highest teacher scores: 1 of 2</p>
            <p>Concert performance: not yet recorded</p>
          </div>

          {permissions.canManageRewards && (
            <div className="card form-card">
              <h2>Family rewards</h2>
              <label>
                Reward name
                <input value={rewardName} onChange={(event) => setRewardName(event.target.value)} placeholder="Add a reward" />
              </label>
              <button type="button" className="primary-button" onClick={addReward}>Add reward</button>
              <ul className="reward-list">
                {rewards.map((reward) => (
                  <li key={reward.id}>
                    <span>{reward.name}</span>
                    <div className="reward-actions">
                      <button type="button" className="mini-button" onClick={() => toggleReward(reward.id)}>
                        {reward.active ? 'Active' : 'Disabled'}
                      </button>
                      <button type="button" className="mini-button" onClick={() => deleteReward(reward.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <h2>Special fruit</h2>
            <p className="reward-reveal">{openedRewardName ?? `Your next magical fruit is growing.`}</p>
            <p className="reward-reveal">{activeFruitReward}</p>
          </div>

          <div className="card">
            <h2>Recent practice</h2>
            <ul className="record-list">
              {records.slice(0, 4).map((record) => (
                <li key={record.id}>
                  <strong>{record.date}</strong>
                  <span>{record.minutes} min · {record.quality}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card notice">
            <h2>Role note</h2>
            <p>{MVP_ROLE_NOTE}</p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
