import type { TreeStage } from './treeStageBlueprints'

export const selectDeveloperPreviewStage = (persistedStage: TreeStage, previewStage: TreeStage, enabled: boolean) => enabled ? previewStage : persistedStage
