export type TreeStage = 1 | 2 | 3 | 4 | 5

export interface TreeStageBlueprint {
  stage: TreeStage
  name: string
  trunk: {
    heightScale: number
    widthScale: number
    detailLevel: number
    rootVisibility: number
  }
  branches: {
    mainBranchIds: string[]
    secondaryBranchIds: string[]
  }
  crown: {
    widthScale: number
    heightScale: number
  }
  availableLeafSlotIds: string[]
  availableFlowerSlotIds: string[]
  availableFruitSlotIds: string[]
  availableCreatureSlotIds: string[]
  availableDecorationSlotIds: string[]
}

export interface TreeBranch {
  id: string
  parentBranchId?: string
  unlockedAtStage: TreeStage
  pathDefinition: string
  leafSlotIds: string[]
  flowerSlotIds: string[]
  fruitSlotIds: string[]
}

export const TREE_LEAF_SLOTS = Array.from({ length: 52 }, (_, index) => {
  const angle = (index / 52) * Math.PI * 2 + 0.9
  const radius = 78 + (index % 7) * 11 + Math.floor(index / 7) * 5
  const x = 160 + Math.cos(angle) * radius
  const y = 136 + Math.sin(angle) * radius * 0.76 - (index % 3) * 6
  const scale = index % 5 === 0 ? 1.2 : index % 5 === 1 ? 1.0 : 0.85

  return {
    id: `leaf_slot_${String(index + 1).padStart(2, '0')}`,
    x,
    y,
    scale,
    rotation: (index * 17) % 360,
  }
})

export const TREE_FLOWER_SLOTS = [
  { id: 'flower_slot_01', x: 132, y: 170 },
  { id: 'flower_slot_02', x: 190, y: 174 },
  { id: 'flower_slot_03', x: 118, y: 203 },
  { id: 'flower_slot_04', x: 205, y: 201 },
  { id: 'flower_slot_05', x: 154, y: 158 },
  { id: 'flower_slot_06', x: 172, y: 152 },
  { id: 'flower_slot_07', x: 105, y: 230 },
  { id: 'flower_slot_08', x: 214, y: 225 },
  { id: 'flower_slot_09', x: 145, y: 214 },
  { id: 'flower_slot_10', x: 177, y: 216 },
]

export const TREE_FRUIT_SLOTS = [
  { id: 'fruit_slot_01', x: 146, y: 203 },
  { id: 'fruit_slot_02', x: 174, y: 201 },
  { id: 'fruit_slot_03', x: 123, y: 228 },
  { id: 'fruit_slot_04', x: 198, y: 228 },
  { id: 'fruit_slot_05', x: 154, y: 170 },
  { id: 'fruit_slot_06', x: 168, y: 170 },
  { id: 'fruit_slot_07', x: 110, y: 179 },
  { id: 'fruit_slot_08', x: 211, y: 182 },
]

export const TREE_CREATURE_SLOTS = [
  { id: 'creature_slot_01', x: 204, y: 208 },
  { id: 'creature_slot_02', x: 115, y: 235 },
  { id: 'creature_slot_03', x: 220, y: 180 },
  { id: 'creature_slot_04', x: 90, y: 190 },
]

export const TREE_DECORATION_SLOTS = [
  { id: 'memory_slot_01', x: 150, y: 95 },
  { id: 'memory_slot_02', x: 118, y: 138 },
  { id: 'memory_slot_03', x: 183, y: 138 },
  { id: 'memory_slot_04', x: 96, y: 184 },
  { id: 'memory_slot_05', x: 210, y: 184 },
]

export const TREE_BRANCHES: TreeBranch[] = [
  { id: 'trunk', parentBranchId: undefined, unlockedAtStage: 1, pathDefinition: 'M160 322 L160 170', leafSlotIds: [], flowerSlotIds: [], fruitSlotIds: [] },
  { id: 'branch_left_lower', parentBranchId: 'trunk', unlockedAtStage: 1, pathDefinition: 'M160 210 C 118 195, 104 168, 74 132', leafSlotIds: ['leaf_slot_01', 'leaf_slot_02', 'leaf_slot_03', 'leaf_slot_04'], flowerSlotIds: ['flower_slot_01'], fruitSlotIds: [] },
  { id: 'branch_right_lower', parentBranchId: 'trunk', unlockedAtStage: 1, pathDefinition: 'M160 210 C 202 195, 218 170, 246 132', leafSlotIds: ['leaf_slot_05', 'leaf_slot_06', 'leaf_slot_07', 'leaf_slot_08'], flowerSlotIds: ['flower_slot_02'], fruitSlotIds: [] },
  { id: 'branch_left_upper', parentBranchId: 'trunk', unlockedAtStage: 2, pathDefinition: 'M160 178 C 126 160, 111 126, 96 94', leafSlotIds: ['leaf_slot_09', 'leaf_slot_10', 'leaf_slot_11'], flowerSlotIds: ['flower_slot_03'], fruitSlotIds: [] },
  { id: 'branch_right_upper', parentBranchId: 'trunk', unlockedAtStage: 2, pathDefinition: 'M160 178 C 192 160, 206 126, 220 94', leafSlotIds: ['leaf_slot_12', 'leaf_slot_13', 'leaf_slot_14'], flowerSlotIds: ['flower_slot_04'], fruitSlotIds: ['fruit_slot_05'] },
  { id: 'branch_left_lower_a', parentBranchId: 'branch_left_lower', unlockedAtStage: 2, pathDefinition: 'M108 152 C 90 142, 81 127, 75 112', leafSlotIds: ['leaf_slot_15', 'leaf_slot_16'], flowerSlotIds: [], fruitSlotIds: [] },
  { id: 'branch_right_lower_a', parentBranchId: 'branch_right_lower', unlockedAtStage: 2, pathDefinition: 'M212 152 C 230 144, 239 129, 244 112', leafSlotIds: ['leaf_slot_17', 'leaf_slot_18'], flowerSlotIds: [], fruitSlotIds: [] },
  { id: 'branch_left_lower_b', parentBranchId: 'branch_left_lower', unlockedAtStage: 3, pathDefinition: 'M110 160 C 82 168, 65 188, 54 212', leafSlotIds: ['leaf_slot_19', 'leaf_slot_20', 'leaf_slot_21'], flowerSlotIds: ['flower_slot_05'], fruitSlotIds: [] },
  { id: 'branch_right_lower_b', parentBranchId: 'branch_right_lower', unlockedAtStage: 3, pathDefinition: 'M210 160 C 238 168, 255 188, 266 212', leafSlotIds: ['leaf_slot_22', 'leaf_slot_23', 'leaf_slot_24'], flowerSlotIds: ['flower_slot_06'], fruitSlotIds: [] },
  { id: 'branch_left_mid', parentBranchId: 'branch_left_upper', unlockedAtStage: 3, pathDefinition: 'M118 120 C 95 108, 86 86, 82 64', leafSlotIds: ['leaf_slot_25', 'leaf_slot_26', 'leaf_slot_27'], flowerSlotIds: ['flower_slot_07'], fruitSlotIds: ['fruit_slot_01'] },
  { id: 'branch_right_mid', parentBranchId: 'branch_right_upper', unlockedAtStage: 3, pathDefinition: 'M202 120 C 225 108, 234 86, 238 64', leafSlotIds: ['leaf_slot_28', 'leaf_slot_29', 'leaf_slot_30'], flowerSlotIds: ['flower_slot_08'], fruitSlotIds: ['fruit_slot_02'] },
  { id: 'branch_top_left', parentBranchId: 'branch_left_upper', unlockedAtStage: 4, pathDefinition: 'M118 92 C 96 72, 82 44, 78 28', leafSlotIds: ['leaf_slot_31', 'leaf_slot_32', 'leaf_slot_33'], flowerSlotIds: ['flower_slot_09'], fruitSlotIds: ['fruit_slot_03'] },
  { id: 'branch_top_right', parentBranchId: 'branch_right_upper', unlockedAtStage: 4, pathDefinition: 'M202 92 C 224 72, 238 44, 242 28', leafSlotIds: ['leaf_slot_34', 'leaf_slot_35', 'leaf_slot_36'], flowerSlotIds: ['flower_slot_10'], fruitSlotIds: ['fruit_slot_04'] },
  { id: 'branch_left_upper_extra', parentBranchId: 'branch_left_mid', unlockedAtStage: 5, pathDefinition: 'M110 88 C 84 74, 62 52, 52 36', leafSlotIds: ['leaf_slot_37','leaf_slot_38','leaf_slot_39'], flowerSlotIds: [], fruitSlotIds: ['fruit_slot_06'] },
  { id: 'branch_right_upper_extra', parentBranchId: 'branch_right_mid', unlockedAtStage: 5, pathDefinition: 'M210 88 C 236 74, 258 52, 268 36', leafSlotIds: ['leaf_slot_40','leaf_slot_41','leaf_slot_42'], flowerSlotIds: [], fruitSlotIds: ['fruit_slot_07'] },
  { id: 'branch_top_crown', parentBranchId: 'trunk', unlockedAtStage: 5, pathDefinition: 'M160 150 C 150 96, 156 62, 160 34', leafSlotIds: ['leaf_slot_43','leaf_slot_44','leaf_slot_45','leaf_slot_46'], flowerSlotIds: [], fruitSlotIds: ['fruit_slot_08'] },
]

const stageLeafSlots = (count: number) => TREE_LEAF_SLOTS.slice(0, count).map((slot) => slot.id)
const stageFlowerSlots = (count: number) => TREE_FLOWER_SLOTS.slice(0, count).map((slot) => slot.id)
const stageFruitSlots = (count: number) => TREE_FRUIT_SLOTS.slice(0, count).map((slot) => slot.id)

export const TREE_STAGE_BLUEPRINTS: Record<TreeStage, TreeStageBlueprint> = {
  1: {
    stage: 1,
    name: 'Enchanted Young Tree',
    trunk: { heightScale: 0.88, widthScale: 0.9, detailLevel: 2, rootVisibility: 0.35 },
    branches: {
      mainBranchIds: ['branch_left_lower', 'branch_right_lower', 'branch_left_upper'],
      secondaryBranchIds: ['branch_left_lower_a', 'branch_right_lower_a'],
    },
    crown: { widthScale: 0.78, heightScale: 0.74 },
    availableLeafSlotIds: stageLeafSlots(18),
    availableFlowerSlotIds: stageFlowerSlots(2),
    availableFruitSlotIds: stageFruitSlots(0),
    availableCreatureSlotIds: [],
    availableDecorationSlotIds: ['memory_slot_01'],
  },
  2: {
    stage: 2,
    name: 'Crystal Music Tree',
    trunk: { heightScale: 1, widthScale: 1, detailLevel: 3, rootVisibility: 0.5 },
    branches: {
      mainBranchIds: ['branch_left_lower', 'branch_right_lower', 'branch_left_upper', 'branch_right_upper'],
      secondaryBranchIds: ['branch_left_lower_a', 'branch_right_lower_a', 'branch_left_lower_b', 'branch_right_lower_b'],
    },
    crown: { widthScale: 0.96, heightScale: 0.9 },
    availableLeafSlotIds: stageLeafSlots(28),
    availableFlowerSlotIds: stageFlowerSlots(4),
    availableFruitSlotIds: stageFruitSlots(1),
    availableCreatureSlotIds: ['creature_slot_01'],
    availableDecorationSlotIds: ['memory_slot_01', 'memory_slot_02'],
  },
  3: {
    stage: 3,
    name: 'Singing Winter Tree',
    trunk: { heightScale: 1.18, widthScale: 1.14, detailLevel: 4, rootVisibility: 0.68 },
    branches: {
      mainBranchIds: ['branch_left_lower', 'branch_right_lower', 'branch_left_upper', 'branch_right_upper', 'branch_left_mid'],
      secondaryBranchIds: ['branch_left_lower_a', 'branch_right_lower_a', 'branch_left_lower_b', 'branch_right_lower_b', 'branch_left_mid', 'branch_right_mid'],
    },
    crown: { widthScale: 1.12, heightScale: 1.02 },
    availableLeafSlotIds: stageLeafSlots(36),
    availableFlowerSlotIds: stageFlowerSlots(6),
    availableFruitSlotIds: stageFruitSlots(3),
    availableCreatureSlotIds: ['creature_slot_01', 'creature_slot_02'],
    availableDecorationSlotIds: ['memory_slot_01', 'memory_slot_02', 'memory_slot_03'],
  },
  4: {
    stage: 4,
    name: 'Great Musical Tree',
    trunk: { heightScale: 1.34, widthScale: 1.28, detailLevel: 5, rootVisibility: 0.82 },
    branches: {
      mainBranchIds: ['branch_left_lower', 'branch_right_lower', 'branch_left_upper', 'branch_right_upper', 'branch_left_mid', 'branch_right_mid', 'branch_top_left'],
      secondaryBranchIds: ['branch_left_lower_a', 'branch_right_lower_a', 'branch_left_lower_b', 'branch_right_lower_b', 'branch_left_mid', 'branch_right_mid', 'branch_top_left', 'branch_top_right'],
    },
    crown: { widthScale: 1.3, heightScale: 1.18 },
    availableLeafSlotIds: stageLeafSlots(44),
    availableFlowerSlotIds: stageFlowerSlots(8),
    availableFruitSlotIds: stageFruitSlots(5),
    availableCreatureSlotIds: ['creature_slot_01', 'creature_slot_02', 'creature_slot_03'],
    availableDecorationSlotIds: ['memory_slot_01', 'memory_slot_02', 'memory_slot_03', 'memory_slot_04'],
  },
  5: {
    stage: 5,
    name: 'Grand Memory Tree',
    trunk: { heightScale: 1.5, widthScale: 1.4, detailLevel: 6, rootVisibility: 1 },
    branches: {
      mainBranchIds: ['branch_left_lower', 'branch_right_lower', 'branch_left_upper', 'branch_right_upper', 'branch_left_mid', 'branch_right_mid', 'branch_top_left', 'branch_top_right', 'branch_top_crown'],
      secondaryBranchIds: ['branch_left_lower_a', 'branch_right_lower_a', 'branch_left_lower_b', 'branch_right_lower_b', 'branch_left_mid', 'branch_right_mid', 'branch_top_left', 'branch_top_right', 'branch_left_upper_extra', 'branch_right_upper_extra'],
    },
    crown: { widthScale: 1.5, heightScale: 1.38 },
    availableLeafSlotIds: stageLeafSlots(52),
    availableFlowerSlotIds: stageFlowerSlots(10),
    availableFruitSlotIds: stageFruitSlots(8),
    availableCreatureSlotIds: ['creature_slot_01', 'creature_slot_02', 'creature_slot_03', 'creature_slot_04'],
    availableDecorationSlotIds: ['memory_slot_01', 'memory_slot_02', 'memory_slot_03', 'memory_slot_04', 'memory_slot_05'],
  },
}
