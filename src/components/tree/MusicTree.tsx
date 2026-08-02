import type { TreeState } from '../../domain/types'
import { TREE_STAGE_BLUEPRINTS, type TreeStage } from '../../domain/treeStageBlueprints'
import { TreeStructure } from './TreeStructure'
import { TreeLeaves } from './TreeLeaves'
import { TreeStageTransition } from './TreeStageTransition'

type MusicTreeProps = {
  treeState: TreeState
  stage?: TreeStage
  developerPreview?: boolean
}

export function MusicTree({ treeState, stage, developerPreview = false }: MusicTreeProps) {
  const renderStage = stage ?? (Math.min(5, Math.max(1, treeState.stage)) as TreeStage)
  const blueprint = TREE_STAGE_BLUEPRINTS[renderStage]
  const visibleLeafIds = blueprint.availableLeafSlotIds.slice(0, Math.max(10, Math.min(blueprint.availableLeafSlotIds.length, Math.max(treeState.leafCount, 12))))
  const visibleFlowers = blueprint.availableFlowerSlotIds.slice(0, Math.min(blueprint.availableFlowerSlotIds.length, Math.max(2, treeState.flowerCount)))
  const visibleFruits = blueprint.availableFruitSlotIds.slice(0, Math.min(blueprint.availableFruitSlotIds.length, Math.max(0, treeState.fruitCount)))
  const transition = developerPreview && renderStage > 1

  return (
    <svg viewBox="0 0 360 420" className="music-tree" role="img" aria-label={`Music tree stage ${renderStage}`}>
      <defs>
        <linearGradient id="trunkGradient" x1="0" x2="1">
          <stop offset="0%" stopColor="#a5c9ff" />
          <stop offset="50%" stopColor="#7aa7d8" />
          <stop offset="100%" stopColor="#5c5b8d" />
        </linearGradient>
        <linearGradient id="trunkGlow" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(148,196,255,0.15)" />
        </linearGradient>
      </defs>

      <circle cx="180" cy="180" r={150 + treeState.glowLevel * 4} fill="rgba(170, 214, 255, 0.14)" />
      <circle cx="180" cy="180" r={118 + treeState.glowLevel * 4} fill="rgba(255,255,255,0.08)" />
      <ellipse cx="180" cy="370" rx="118" ry="22" fill="rgba(173, 217, 255, 0.38)" />

      <g className="winter-sparkles">
        {[...Array(14)].map((_, index) => (
          <circle
            key={`spark-${index}`}
            cx={24 + index * 24}
            cy={48 + (index % 5) * 22}
            r={2 + (index % 3) * 0.7}
            fill="rgba(255,255,255,0.8)"
          />
        ))}
      </g>

      <g className="tree-trunk">
        <path
          d="M165 324 L165 162 L195 162 L195 324 Z"
          fill="url(#trunkGradient)"
          opacity="0.96"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        <path d="M165 180 L195 180 M165 215 L195 215 M165 250 L195 250 M165 285 L195 285" stroke="rgba(255,255,255,0.24)" strokeWidth="2" />
        <path d="M170 164 L188 144 L190 170" fill="rgba(190,232,255,0.35)" opacity="0.8" />
      </g>

      <TreeStructure stage={renderStage} treeState={treeState} />
      <TreeLeaves stage={renderStage} visibleLeafIds={visibleLeafIds} activeLeafSlots={visibleLeafIds} />

      {visibleFlowers.map((flowerId) => {
        const slot = blueprint.availableFlowerSlotIds.find((candidate) => candidate === flowerId)
        if (!slot) return null
        return null
      })}

      {visibleFruits.map((fruitId) => {
        const slot = blueprint.availableFruitSlotIds.find((candidate) => candidate === fruitId)
        if (!slot) return null
        const fruitSlots = {
          'fruit_slot_01': { x: 146, y: 203 },
          'fruit_slot_02': { x: 174, y: 201 },
          'fruit_slot_03': { x: 123, y: 228 },
          'fruit_slot_04': { x: 198, y: 228 },
          'fruit_slot_05': { x: 154, y: 170 },
          'fruit_slot_06': { x: 168, y: 170 },
          'fruit_slot_07': { x: 110, y: 179 },
          'fruit_slot_08': { x: 211, y: 182 },
        }
        const coords = fruitSlots[fruitId as keyof typeof fruitSlots] ?? { x: 160, y: 180 }
        return (
          <g key={fruitId} transform={`translate(${coords.x} ${coords.y})`}>
            <circle r="7.5" fill="rgba(103, 224, 205, 0.96)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" />
            <path d="M0 -11 L4 -18 L8 -11" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" />
          </g>
        )
      })}

      {renderStage >= 2 && (
        <g className="notes">
          {[0, 1, 2].map((index) => (
            <g key={`note-${index}`} transform={`translate(${120 + index * 36} ${100 + (index % 2) * 38})`}>
              <path d="M0 0 L0 20 L12 20 L12 0 Z" fill="rgba(204, 234, 255, 0.72)" />
              <circle cx="12" cy="20" r="4" fill="rgba(204, 234, 255, 0.72)" />
            </g>
          ))}
        </g>
      )}

      {treeState.creatureState !== 'hidden' && (
        <g className="creature" transform="translate(226 238)">
          <ellipse cx="0" cy="0" rx="18" ry="13" fill="rgba(187,212,255,0.88)" />
          <circle cx="-6" cy="-2" r="2.2" fill="#4c5c86" />
          <circle cx="6" cy="-2" r="2.2" fill="#4c5c86" />
          <path d="M-5 6 Q0 10 5 6" fill="none" stroke="#4c5c86" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      <TreeStageTransition active={transition} fromStage={Math.max(1, renderStage - 1)} toStage={renderStage} />
    </svg>
  )
}
