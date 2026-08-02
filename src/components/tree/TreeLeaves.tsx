import { TREE_LEAF_SLOTS } from '../../domain/treeStageBlueprints'
import { MusicLeaf } from './MusicLeaf'

type TreeLeavesProps = {
  stage: 1 | 2 | 3 | 4 | 5
  visibleLeafIds: string[]
  activeLeafSlots?: string[]
}

export function TreeLeaves({ stage, visibleLeafIds, activeLeafSlots = [] }: TreeLeavesProps) {
  const visibleLeafSet = new Set(visibleLeafIds)
  const slots = TREE_LEAF_SLOTS.filter((slot) => visibleLeafSet.has(slot.id) || activeLeafSlots.includes(slot.id))

  return (
    <g className="tree-leaves">
      {slots.map((slot, index) => {
        const variant = ['blue', 'turquoise', 'lavender', 'pink'][index % 4] as 'blue' | 'turquoise' | 'lavender' | 'pink'
        const size = index % 7 === 0 ? 'large' : index % 3 === 0 ? 'medium' : 'small'
        const rotation = slot.rotation
        const symbol = index % 11 === 0 ? 'note' : undefined
        const state = index % 13 === 0 ? 'recovering' : 'healthy'

        return (
          <MusicLeaf
            key={slot.id}
            id={slot.id}
            slotId={slot.id}
            variant={variant}
            size={size}
            rotation={rotation}
            symbol={symbol}
            state={state}
            x={slot.x}
            y={slot.y}
            newlyUnlocked={stage === 1 && index < 4}
          />
        )
      })}
    </g>
  )
}
