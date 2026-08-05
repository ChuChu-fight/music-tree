import { useState } from 'react'
import { localRepository } from '../../data/localRepository'
import { vacationStatus, type VacationPeriod } from '../../domain/vacation'

export function VacationManager() {
  const today = new Date().toISOString().slice(0, 10)
  const [periods, setPeriods] = useState(() => localRepository.getVacationPeriods())
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [note, setNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const reset = () => { setStartDate(''); setEndDate(''); setNote(''); setEditingId(null) }
  const refresh = () => setPeriods(localRepository.getVacationPeriods())
  const save = () => {
    try {
      const values = { startDate, endDate, note }
      if (editingId) localRepository.updateVacationPeriod(editingId, values)
      else localRepository.addVacationPeriod(values)
      refresh(); reset(); setMessage('Urlaub period saved.')
    } catch (caught) { setMessage(caught instanceof Error ? caught.message : 'Urlaub period could not be saved.') }
  }
  const edit = (period: VacationPeriod) => { setEditingId(period.id); setStartDate(period.startDate); setEndDate(period.endDate); setNote(period.note ?? ''); setMessage('') }
  const cancel = (period: VacationPeriod) => {
    if (!window.confirm(`Cancel Urlaub from ${period.startDate} to ${period.endDate}?`)) return
    try { localRepository.cancelVacationPeriod(period.id); refresh(); setMessage('Scheduled Urlaub cancelled.') } catch (caught) { setMessage(caught instanceof Error ? caught.message : 'Urlaub could not be cancelled.') }
  }
  const endEarly = (period: VacationPeriod) => {
    if (!window.confirm('End the active Urlaub now?')) return
    try { localRepository.endVacationPeriodEarly(period.id); refresh(); setMessage('Urlaub ended early.') } catch (caught) { setMessage(caught instanceof Error ? caught.message : 'Urlaub could not be ended.') }
  }

  return <section className="card form-card vacation-manager">
    <h2>Urlaub / Pause</h2>
    <p>Health and Stage time are paused during Urlaub. Optional practice can still help the tree grow.</p>
    <div className="vacation-form-grid"><label>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
    <label>Optional note<textarea rows={2} maxLength={200} value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <div className="homework-form-actions"><button type="button" className="primary-button" onClick={save}>{editingId ? 'Save changes' : 'Save Urlaub'}</button>{editingId && <button type="button" className="mini-button" onClick={reset}>Cancel editing</button>}</div>
    {message && <p className="data-tool-message" role="status">{message}</p>}
    <ul className="vacation-period-list">{[...periods].sort((left, right) => right.startDate.localeCompare(left.startDate)).map((period) => {
      const status = vacationStatus(period, today)
      return <li key={period.id}><div><strong>{period.startDate} – {period.endDate}</strong><span>{status}</span>{period.note && <small>{period.note}</small>}</div><div className="reward-actions">{status === 'scheduled' && <><button type="button" className="mini-button" onClick={() => edit(period)}>Edit</button><button type="button" className="mini-button" onClick={() => cancel(period)}>Cancel</button></>}{status === 'active' && <button type="button" className="mini-button" onClick={() => endEarly(period)}>End early</button>}</div></li>
    })}</ul>
  </section>
}
