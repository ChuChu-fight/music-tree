import { localRepository } from '../../data/localRepository'

export function ParentStageProgress() {
  const tree = localRepository.getTreeState()
  if (tree.stage >= 5) return <section className="card parent-stage-progress"><h2>Stage progress</h2><p>Stage 5 is permanently unlocked.</p></section>
  const result = localRepository.getCurrentStageProgression()
  return <section className="card parent-stage-progress" aria-labelledby="parent-stage-progress-title">
    <h2 id="parent-stage-progress-title">Stage {result.currentStage} → {result.nextStage}</h2>
    <ul>{result.requirements.map((item) => <li key={item.id}><span>{item.label}</span><strong>{item.actual} / {item.required}</strong></li>)}</ul>
    <p>{result.eligibleForNextStage ? 'All six requirements are complete.' : 'Every requirement must reach its target before the next stage unlocks.'}</p>
  </section>
}
