import type { LeafColor } from '../../domain/treeStageBlueprints'

type MusicLeafProps = {
  id: string
  slotId: string
  branchId: string
  variant: LeafColor
  size: 'medium' | 'large'
  rotation: number
  x: number
  y: number
  attachmentX: number
  attachmentY: number
  onSelect?: (slotId: string) => void
}

const variantColors: Record<LeafColor, { deep: string; mid: string; light: string }> = {
  blue: { deep: '#4d8fd0', mid: '#8ed4f4', light: '#e8fbff' },
  turquoise: { deep: '#278f9f', mid: '#69d5d5', light: '#e1fffb' },
  lavender: { deep: '#8068b8', mid: '#b9a5e7', light: '#f3ebff' },
  pink: { deep: '#b96e9f', mid: '#e5a7cc', light: '#fff0f8' },
}

const sizeMap = { medium: 18.5, large: 23.5 } as const

export function MusicLeaf({ id, slotId, branchId, variant, size, rotation, x, y, attachmentX, attachmentY, onSelect }: MusicLeafProps) {
  const colors = variantColors[variant]
  const leafSize = sizeMap[size]
  const gradientId = `leaf-gradient-${id}`
  const engravedNote = ['leaf_slot_03', 'leaf_slot_08', 'leaf_slot_13'].includes(slotId)

  return (
    <g data-slot={slotId} data-branch={branchId}>
      <path d={`M${attachmentX} ${attachmentY} L${x} ${y}`} className="leaf-twig" />
      <circle cx={attachmentX} cy={attachmentY} r="2.8" className="leaf-attachment" />
      <g transform={`translate(${x} ${y}) rotate(${rotation})`} className={onSelect ? 'crystal-leaf interactive-tree-item' : 'crystal-leaf'} role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={onSelect ? 'New crystal leaf' : undefined} onClick={onSelect ? () => onSelect(slotId) : undefined} onKeyDown={onSelect ? (event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(slotId) } : undefined}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.light} />
            <stop offset="48%" stopColor={colors.mid} />
            <stop offset="100%" stopColor={colors.deep} />
          </linearGradient>
        </defs>
        <path
          d={`M-2 ${-leafSize * 0.92} Q0 ${-leafSize * 1.04} 2 ${-leafSize * 0.92} C${leafSize * 0.78} ${-leafSize * 0.62} ${leafSize * 0.96} ${leafSize * 0.26} ${leafSize * 0.5} ${leafSize * 0.72} Q0 ${leafSize * 1.04} ${-leafSize * 0.5} ${leafSize * 0.72} C${-leafSize * 0.96} ${leafSize * 0.26} ${-leafSize * 0.78} ${-leafSize * 0.62} -2 ${-leafSize * 0.92} Z`}
          fill={`url(#${gradientId})`}
          className="leaf-silhouette"
        />
        <path d={`M0 ${-leafSize * 0.72} Q${leafSize * 0.04} 0 0 ${leafSize * 0.76}`} className="leaf-vein" />
        <path d={`M0 ${-leafSize * 0.45} Q${leafSize * 0.42} ${-leafSize * 0.2} ${leafSize * 0.48} ${leafSize * 0.12} Q${leafSize * 0.26} ${leafSize * 0.32} 0 ${leafSize * 0.42} Q${-leafSize * 0.3} ${leafSize * 0.25} ${-leafSize * 0.46} ${leafSize * 0.04} Z`} className="leaf-facet leaf-facet-light" />
        <path d={`M0 ${-leafSize * 0.45} Q${-leafSize * 0.46} ${-leafSize * 0.1} ${-leafSize * 0.46} ${leafSize * 0.04} Q${-leafSize * 0.25} ${leafSize * 0.3} 0 ${leafSize * 0.42} Z`} className="leaf-facet leaf-facet-shadow" />
        {engravedNote && <g className="leaf-note-engraving"><circle cx={leafSize * 0.28} cy={leafSize * 0.27} r={leafSize * 0.13} /><path d={`M${leafSize * 0.4} ${leafSize * 0.25} L${leafSize * 0.4} ${-leafSize * 0.36}`} /></g>}
      </g>
    </g>
  )
}
