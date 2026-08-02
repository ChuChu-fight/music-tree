type MusicLeafProps = {
  id: string
  slotId: string
  variant: 'blue' | 'turquoise' | 'lavender' | 'pink'
  size: 'small' | 'medium' | 'large'
  rotation: number
  symbol?: 'note' | 'treble_clef' | 'rhythm'
  state: 'healthy' | 'drooping' | 'recovering'
  newlyUnlocked?: boolean
  x: number
  y: number
}

const variantColors: Record<MusicLeafProps['variant'], { fill: string; accent: string }> = {
  blue: { fill: '#d7f4ff', accent: '#9edaf6' },
  turquoise: { fill: '#b8f3f6', accent: '#7dd1de' },
  lavender: { fill: '#e8dafb', accent: '#bfabec' },
  pink: { fill: '#f9d8ee', accent: '#e6add5' },
}

const sizeMap: Record<MusicLeafProps['size'], number> = {
  small: 10,
  medium: 13,
  large: 16,
}

export function MusicLeaf({ id, slotId, variant, size, rotation, symbol, state, newlyUnlocked, x, y }: MusicLeafProps) {
  const colors = variantColors[variant]
  const leafSize = sizeMap[size]
  const stateShift = state === 'drooping' ? 8 : state === 'recovering' ? -4 : 0
  const glow = newlyUnlocked ? 0.9 : 0.75

  return (
    <g
      key={id}
      data-slot={slotId}
      transform={`translate(${x} ${y}) rotate(${rotation})`}
      style={{ opacity: glow }}
    >
      <path
        d={`M 0 ${-leafSize * 1.6} C ${leafSize * 1.2} ${-leafSize * 1.2}, ${leafSize * 1.3} ${leafSize * 0.4}, 0 ${leafSize * 1.7} C ${-leafSize * 1.4} ${leafSize * 0.8}, ${-leafSize * 1.2} ${-leafSize * 0.8}, 0 ${-leafSize * 1.6} Z`}
        fill={colors.fill}
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1.4"
      />
      <path
        d={`M 0 ${-leafSize * 1.4} L 0 ${leafSize * 1.6}`}
        stroke="rgba(86,118,159,0.75)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d={`M 0 ${-leafSize * 0.7} Q ${leafSize * 0.8} ${-leafSize * 0.4}, ${leafSize * 0.9} ${leafSize * 0.15}`}
        stroke={colors.accent}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M 0 ${-leafSize * 0.9} Q ${-leafSize * 0.85} ${-leafSize * 0.2}, ${-leafSize * 0.9} ${leafSize * 0.25}`}
        stroke={colors.accent}
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      {state !== 'healthy' && (
        <path d={`M ${-leafSize * 0.6} ${leafSize * 0.8} Q 0 ${leafSize * 0.5 + stateShift} ${leafSize * 0.7} ${leafSize * 0.9}`} fill="none" stroke="rgba(120,140,180,0.7)" strokeWidth="1" strokeLinecap="round" />
      )}
      {symbol && (
        <g transform={`translate(0 ${-leafSize * 0.2}) scale(0.5)`}>
          {symbol === 'note' && (
            <>
              <path d="M-2 10 L-2 -8 L10 -8 L10 11" fill="none" stroke="rgba(79,121,175,0.9)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="-2" cy="10" r="3" fill="rgba(79,121,175,0.9)" />
            </>
          )}
          {symbol === 'treble_clef' && (
            <path d="M-4 0 C -6 -30, 20 -12, 10 10 C 18 24, 4 30, -2 18 C 4 18, 6 12, 6 8 C 6 2, 0 -1, -4 0 Z" fill="rgba(79,121,175,0.85)" />
          )}
          {symbol === 'rhythm' && (
            <>
              <path d="M-8 -10 L-2 16 M4 -15 L10 14" stroke="rgba(79,121,175,0.9)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="-6" cy="-14" r="3" fill="rgba(79,121,175,0.9)" />
              <circle cx="8" cy="18" r="3" fill="rgba(79,121,175,0.9)" />
            </>
          )}
        </g>
      )}
    </g>
  )
}
