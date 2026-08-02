import { TREE_BRANCHES, TREE_FLOWER_SLOTS, TREE_FRUIT_SLOTS, TREE_LEAF_SLOTS, TREE_STAGE_BLUEPRINTS, type TreeStage } from '../../domain/treeStageBlueprints'
import type { TreeState } from '../../domain/types'

const stageScale = {
  1: 0.82,
  2: 0.92,
  3: 1.08,
  4: 1.2,
  5: 1.34,
} as const

type TreeStructureProps = {
  stage: TreeStage
  treeState: TreeState
}

export function TreeStructure({ stage, treeState: _treeState }: TreeStructureProps) {
  const blueprint = TREE_STAGE_BLUEPRINTS[stage]
  const visibleBranches = TREE_BRANCHES.filter((branch) => branch.unlockedAtStage <= stage)

  const showBranch = (branchId: string) => visibleBranches.some((branch) => branch.id === branchId)

  return (
    <g className="tree-structure" transform={`translate(0 0) scale(${stageScale[stage]})`}>
      <g className="tree-stage-1-structure">
        <path d="M160 322 L160 168" stroke="rgba(126, 112, 168, 0.95)" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M160 182 L140 212 L125 247 L116 286" stroke="rgba(139, 151, 202, 0.9)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M160 182 L180 212 L195 247 L204 286" stroke="rgba(139, 151, 202, 0.9)" strokeWidth="8" fill="none" strokeLinecap="round" />
      </g>

      <g className="tree-stage-2-additions">
        {showBranch('branch_left_upper') && (
          <path d="M160 180 C 132 154, 116 120, 111 88" stroke="rgba(97, 117, 176, 1)" strokeWidth="7" fill="none" strokeLinecap="round" />
        )}
        {showBranch('branch_right_upper') && (
          <path d="M160 180 C 188 154, 204 120, 210 88" stroke="rgba(97, 117, 176, 1)" strokeWidth="7" fill="none" strokeLinecap="round" />
        )}
      </g>

      <g className="tree-stage-3-additions">
        {showBranch('branch_left_mid') && (
          <path d="M118 118 C 96 104, 84 82, 82 58" stroke="rgba(114, 147, 205, 0.96)" strokeWidth="6" fill="none" strokeLinecap="round" />
        )}
        {showBranch('branch_right_mid') && (
          <path d="M202 118 C 224 104, 236 82, 238 58" stroke="rgba(114, 147, 205, 0.96)" strokeWidth="6" fill="none" strokeLinecap="round" />
        )}
      </g>

      <g className="tree-stage-4-additions">
        {showBranch('branch_top_left') && (
          <path d="M118 92 C 98 78, 84 52, 81 26" stroke="rgba(145, 166, 225, 0.96)" strokeWidth="5" fill="none" strokeLinecap="round" />
        )}
        {showBranch('branch_top_right') && (
          <path d="M202 92 C 222 80, 236 52, 240 26" stroke="rgba(145, 166, 225, 0.96)" strokeWidth="5" fill="none" strokeLinecap="round" />
        )}
      </g>

      <g className="tree-stage-5-additions">
        {showBranch('branch_left_upper_extra') && (
          <path d="M112 88 C 86 70, 64 52, 52 38" stroke="rgba(166, 189, 242, 0.96)" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
        {showBranch('branch_right_upper_extra') && (
          <path d="M208 88 C 234 70, 256 52, 268 38" stroke="rgba(166, 189, 242, 0.96)" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
        {showBranch('branch_top_crown') && (
          <path d="M160 146 C 146 108, 152 78, 160 42" stroke="rgba(185, 208, 250, 0.98)" strokeWidth="4.2" fill="none" strokeLinecap="round" />
        )}
      </g>

      {stage >= 1 && (
        <g className="roots">
          <path d="M148 322 C 138 334, 126 340, 116 348" stroke="rgba(112, 155, 198, 0.7)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M172 322 C 182 334, 194 340, 204 348" stroke="rgba(112, 155, 198, 0.7)" strokeWidth="4" fill="none" strokeLinecap="round" />
          {stage >= 3 && <path d="M160 322 C 150 344, 144 352, 140 360" stroke="rgba(112, 155, 198, 0.75)" strokeWidth="4" fill="none" strokeLinecap="round" />}
        </g>
      )}

      <g className="tree-crown-structure">
        {TREE_LEAF_SLOTS.slice(0, blueprint.availableLeafSlotIds.length).map((slot) => (
          <circle key={slot.id} cx={slot.x} cy={slot.y} r={2.3} fill="rgba(164, 198, 255, 0.4)" />
        ))}
      </g>

      {stage >= 2 && TREE_FLOWER_SLOTS.slice(0, blueprint.availableFlowerSlotIds.length).map((slot) => (
        <g key={slot.id} transform={`translate(${slot.x} ${slot.y})`}>
          <circle r="7" fill="rgba(144,214,255,0.82)" /><circle r="3" fill="rgba(255,255,255,0.9)" />
        </g>
      ))}

      {stage >= 1 && TREE_FRUIT_SLOTS.slice(0, blueprint.availableFruitSlotIds.length).map((slot) => (
        <g key={slot.id} transform={`translate(${slot.x} ${slot.y})`}>
          <circle r="5" fill="rgba(111, 220, 207, 0.86)" stroke="rgba(255,255,255,0.74)" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  )
}
