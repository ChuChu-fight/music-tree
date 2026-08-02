type TreeStageTransitionProps = {
  active: boolean
  fromStage: number
  toStage: number
}

export function TreeStageTransition({ active, fromStage, toStage }: TreeStageTransitionProps) {
  if (!active) return null

  return (
    <g className="tree-stage-transition" aria-label={`Stage transition from ${fromStage} to ${toStage}`}>
      <circle cx="160" cy="148" r="110" fill="rgba(180, 224, 255, 0.1)" />
      <circle cx="160" cy="148" r="78" fill="rgba(221, 242, 255, 0.12)" />
      <path d="M160 54 L160 102 M142 70 L160 54 L178 70" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M118 130 Q160 160 202 130" fill="none" stroke="rgba(176, 216, 255, 0.84)" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}
