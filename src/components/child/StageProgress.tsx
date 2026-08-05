type StageProgressProps = { currentName: string; nextName?: string; percentage: number | null; message: string; structureComplete?: boolean }

export function StageProgress({ currentName, nextName, percentage, message, structureComplete = false }: StageProgressProps) {
  return (
    <section className="child-stage-progress" aria-labelledby="child-stage-title">
      <div><p className="child-kicker">Current stage</p><h1 id="child-stage-title">{currentName}</h1></div>
      <div className="stage-next"><span>{nextName ? 'Next' : 'Structure'}</span><strong>{nextName ?? 'Grand tree complete'}</strong></div>
      {percentage === null ? <div className="stage-progress-unconfigured">{structureComplete ? message : 'The next magical journey is not ready yet.'}</div> : <><div className="stage-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-label={`Stage progress ${percentage}%`}><span style={{ width: `${percentage}%` }} /></div><div className="stage-progress-caption"><strong>{percentage}%</strong><span>{message}</span></div></>}
    </section>
  )
}
