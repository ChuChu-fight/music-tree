import { REWARD_FRUIT_SLOTS } from './parentReward'
import { TREE_BRANCHES, TREE_FRUIT_SLOTS, TREE_LEAF_SLOTS, TREE_STAGE_BLUEPRINTS, type LeafColor, type TreeLeafSlot, type TreeStage } from './treeStageBlueprints'

export type RenderedLeafSlot = TreeLeafSlot & { generated: boolean; representedLeafCount: number }
export type LeafCluster = { id: string; branchId: string; x: number; y: number; attachmentX: number; attachmentY: number; rotation: number; color: LeafColor; representedLeafCount: number }
export type LeafRenderPlan = { leaves: RenderedLeafSlot[]; clusters: LeafCluster[]; fixedSlotCapacity: number; representedLeafCount: number }

const MAX_GENERATED_LEAVES = 24
const MAX_CLUSTERS = 8
const COLORS: LeafColor[] = ['blue', 'turquoise', 'lavender', 'pink']
const RESERVED_FRUIT_POSITIONS = [...TREE_FRUIT_SLOTS, ...REWARD_FRUIT_SLOTS]

const visibleFixedSlots = (stage: TreeStage) => {
  const availableIds = new Set(TREE_STAGE_BLUEPRINTS[stage].availableLeafSlotIds)
  const visibleBranchIds = new Set(TREE_BRANCHES.filter((branch) => branch.visible !== false).map((branch) => branch.id))
  return TREE_LEAF_SLOTS.filter((slot) => availableIds.has(slot.id) && visibleBranchIds.has(slot.branchId))
}

const safeCoordinate = (anchor: TreeLeafSlot, stage: TreeStage, index: number) => {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const seed = (index + 1) * 37 + stage * 53 + attempt * 71
    const angle = (seed % 360) * Math.PI / 180
    const radius = 20 + (seed % 4) * 7
    const x = Math.round(Math.max(28, Math.min(372, anchor.x + Math.cos(angle) * radius)))
    const y = Math.round(Math.max(38, Math.min(305, anchor.y + Math.sin(angle) * radius * 0.72)))
    if (RESERVED_FRUIT_POSITIONS.every((fruit) => Math.hypot(x - fruit.x, y - fruit.y) >= 31)) return { x, y }
  }
  return { x: Math.max(28, Math.min(372, anchor.x)), y: Math.max(38, Math.min(305, anchor.y - 34)) }
}

export function createLeafRenderPlan(stage: TreeStage, requestedLeafCount: number): LeafRenderPlan {
  const leafCount = Math.max(0, Math.floor(requestedLeafCount))
  const fixedSlots = visibleFixedSlots(stage)
  const fixedCount = Math.min(leafCount, fixedSlots.length)
  const leaves: RenderedLeafSlot[] = fixedSlots.slice(0, fixedCount).map((slot) => ({ ...slot, generated: false, representedLeafCount: 1 }))
  const overflowCount = Math.max(0, leafCount - fixedCount)
  const generatedCount = Math.min(overflowCount, MAX_GENERATED_LEAVES)

  for (let index = 0; index < generatedCount; index += 1) {
    const anchor = fixedSlots[(index * 11 + stage * 3) % fixedSlots.length]
    const position = safeCoordinate(anchor, stage, index)
    leaves.push({ ...anchor, id: `generated_leaf_s${stage}_${String(index + 1).padStart(4, '0')}`, x: position.x, y: position.y, rotation: ((index * 47 + stage * 13) % 121) - 60, size: index % 3 === 0 ? 'large' : 'medium', color: COLORS[(index + stage) % COLORS.length], generated: true, representedLeafCount: 1 })
  }

  const clusteredCount = overflowCount - generatedCount
  const clusterCount = Math.min(clusteredCount, MAX_CLUSTERS)
  const clusters: LeafCluster[] = []
  for (let index = 0; index < clusterCount; index += 1) {
    const anchor = fixedSlots[(index * 13 + stage * 5 + 7) % fixedSlots.length]
    const position = safeCoordinate(anchor, stage, index + MAX_GENERATED_LEAVES)
    const base = Math.floor(clusteredCount / clusterCount)
    clusters.push({ id: `leaf_cluster_s${stage}_${String(index + 1).padStart(2, '0')}`, branchId: anchor.branchId, attachmentX: anchor.attachmentX, attachmentY: anchor.attachmentY, x: position.x, y: position.y, rotation: ((index * 61 + stage * 17) % 91) - 45, color: COLORS[(index * 2 + stage) % COLORS.length], representedLeafCount: base + (index < clusteredCount % clusterCount ? 1 : 0) })
  }

  return { leaves, clusters, fixedSlotCapacity: fixedSlots.length, representedLeafCount: leaves.length + clusters.reduce((sum, cluster) => sum + cluster.representedLeafCount, 0) }
}
