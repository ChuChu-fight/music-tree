import type { AvatarId, TreeState } from '../../domain/types'
import { TREE_STAGE_BLUEPRINTS, type TreeStage } from '../../domain/treeStageBlueprints'
import { TreeStructure } from './TreeStructure'
import { TreeLeaves } from './TreeLeaves'
import { TreeStageTransition } from './TreeStageTransition'
import { TreeSceneCompanions } from './TreeSceneCompanions'
import { ParentRewardFruits } from './ParentRewardFruits'
import type { ParentReward } from '../../domain/parentReward'

type MusicTreeProps = {
  treeState: TreeState
  stage?: TreeStage
  developerPreview?: boolean
  onLeafSelect?: (slotId: string) => void
  onFlowerSelect?: (slotId: string) => void
  onFruitSelect?: (slotId: string) => void
  childAvatarId?: AvatarId
  parentRewards?: ParentReward[]
  onParentRewardSelect?: (reward: ParentReward) => void
}

export function MusicTree({ treeState, stage, developerPreview = false, onLeafSelect, onFlowerSelect, onFruitSelect, childAvatarId, parentRewards = [], onParentRewardSelect }: MusicTreeProps) {
  const renderStage = stage ?? (Math.min(5, Math.max(1, treeState.stage)) as TreeStage)
  const blueprint = TREE_STAGE_BLUEPRINTS[renderStage]
  const transition = developerPreview && renderStage > 1
  const structureTransform = `translate(200 410) scale(${blueprint.structureScale.x} ${blueprint.structureScale.y}) translate(-200 -410)`
  const crownTransform = `translate(200 410) scale(${blueprint.crownScale.x / blueprint.structureScale.x} ${blueprint.crownScale.y / blueprint.structureScale.y}) translate(-200 -410)`
  const auraScale = renderStage === 1 ? 0.72 : blueprint.structureScale.x

  return (
    <svg viewBox="0 0 400 460" className="music-tree" role="img" aria-label={`Music tree stage ${renderStage}`}>
      <defs>
        <linearGradient id="trunkCrystal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#795b52" />
          <stop offset="24%" stopColor="#9a746a" />
          <stop offset="48%" stopColor="#bc918c" />
          <stop offset="67%" stopColor="#d8b9c9" />
          <stop offset="82%" stopColor="#eadde4" />
          <stop offset="100%" stopColor="#8a665e" />
        </linearGradient>
        <radialGradient id="treeAura">
          <stop offset="0%" stopColor="rgba(255,239,247,0.38)" />
          <stop offset="70%" stopColor="rgba(209,186,228,0.14)" />
          <stop offset="100%" stopColor="rgba(151,126,178,0)" />
        </radialGradient>
        <filter id="leafGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="memoryGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="memoryBlur" />
          <feMerge><feMergeNode in="memoryBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx="200" cy="258" rx={(145 + treeState.glowLevel * 8) * auraScale} ry={(165 + treeState.glowLevel * 8) * auraScale} fill="url(#treeAura)" opacity={0.42 + treeState.glowLevel * 0.07} />
      {renderStage === 5 && <>
        <ellipse className="stage-five-crown-aura" cx="200" cy="145" rx="154" ry="125" />
        <ellipse className="stage-five-trunk-aura" cx="200" cy="310" rx="50" ry="118" />
      </>}
      <g className="storybook-winter-background" aria-hidden="true">
        <path className="distant-snow-bank" d="M0 346 Q55 318 112 344 Q167 311 222 341 Q284 303 340 337 Q370 325 400 338 L400 460 L0 460 Z" />
        <path className="near-snow-bank" d="M0 397 Q54 372 111 397 Q165 367 219 399 Q277 365 329 393 Q367 378 400 396 L400 460 L0 460 Z" />
        {[{ x: 28, y: 82, r: 2 }, { x: 74, y: 137, r: 3 }, { x: 126, y: 55, r: 2 }, { x: 178, y: 103, r: 2.5 }, { x: 236, y: 65, r: 2 }, { x: 285, y: 118, r: 3 }, { x: 337, y: 72, r: 2.5 }, { x: 377, y: 151, r: 2 }, { x: 52, y: 213, r: 2 }, { x: 350, y: 228, r: 2.5 }].map((flake, index) => <circle key={index} className={`falling-snow snow-${index + 1}`} cx={flake.x} cy={flake.y} r={flake.r} />)}
        <g className="snow-star snow-star-left" transform="translate(87 105)"><path d="M0 -8 V8 M-7 -4 L7 4 M7 -4 L-7 4" /></g>
        <g className="snow-star snow-star-right" transform="translate(329 142)"><path d="M0 -7 V7 M-6 -3 L6 3 M6 -3 L-6 3" /></g>
        <g className="music-sparkles"><text x="45" y="286">♪</text><text x="334" y="273">♫</text><path d="M72 302 C118 278 146 293 179 269" /><circle cx="76" cy="299" r="2" /><circle cx="139" cy="286" r="1.7" /></g>
      </g>
      <ellipse cx="200" cy="424" rx="126" ry="18" className="tree-ground-shadow" />

      <TreeSceneCompanions stage={renderStage} avatarId={childAvatarId} creatureState={treeState.creatureState} />

      <g className="winter-sparkles" aria-hidden="true">
        {[{ x: 45, y: 86 }, { x: 347, y: 102 }, { x: 34, y: 222 }, { x: 362, y: 252 }, { x: 118, y: 69 }, { x: 292, y: 56 }].map((spark, index) => (
          <circle key={index} cx={spark.x} cy={spark.y} r={index % 2 === 0 ? 2.2 : 1.5} />
        ))}
      </g>

      <g transform={structureTransform}>
        <TreeStructure stage={renderStage} flowerCount={treeState.flowerCount} fruitCount={treeState.fruitCount} crownTransform={crownTransform} onFlowerSelect={onFlowerSelect} onFruitSelect={onFruitSelect} />
        <g transform={crownTransform}><TreeLeaves stage={renderStage} leafCount={treeState.leafCount} onLeafSelect={onLeafSelect} /></g>
        <g transform={crownTransform}><ParentRewardFruits rewards={parentRewards} onSelect={onParentRewardSelect} /></g>
      </g>

      <TreeStageTransition active={transition} fromStage={Math.max(1, renderStage - 1)} toStage={renderStage} />
    </svg>
  )
}
