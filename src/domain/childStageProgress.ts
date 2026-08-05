import { evaluateStageProgression, type StageProgressionInput } from './stageProgressionEngine'

export type ChildStageProgress =
  { status: 'configured'; currentStage: 1 | 2 | 3 | 4; nextStage: 2 | 3 | 4 | 5; percentage: number; eligibleForNextStage: boolean; message: string }

const messageFor = (percentage: number) => {
  if (percentage === 100) return 'Your tree is ready for its magical transformation.'
  if (percentage === 99) return 'One more part of your musical journey is still growing.'
  if (percentage >= 75) return 'Your tree is getting close to its next transformation.'
  if (percentage >= 50) return 'Your next tree stage is taking shape.'
  if (percentage >= 25) return 'Your careful practice is helping new branches grow.'
  return 'Your tree has begun its new musical journey.'
}

export const calculateStageProgress = (progressState: StageProgressionInput): ChildStageProgress => {
  const detailed = evaluateStageProgression(progressState)
  const components = [...detailed.requirements.map((item) => Math.min(1, item.progress))]
  if (detailed.milestone) components.push(detailed.milestone.progress)
  const rawPercentage = components.reduce((sum, value) => sum + value, 0) / components.length * 100
  const percentage = detailed.eligibleForNextStage ? 100 : Math.min(Math.round(rawPercentage), 99)
  return { status: 'configured', currentStage: detailed.currentStage, nextStage: detailed.nextStage, percentage, eligibleForNextStage: detailed.eligibleForNextStage, message: messageFor(percentage) }
}
