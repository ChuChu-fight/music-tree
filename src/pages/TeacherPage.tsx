import { useState, type FormEvent } from 'react'
import { localRepository } from '../data/localRepository'
import { starRatingToPercentage } from '../domain/homeworkEvaluation'
import type { HomeworkItemEvaluation, HomeworkItemImprovementLevel, StarRating } from '../domain/types'

type EvaluationDraft = {
  homeworkItemId: string
  starRating?: StarRating
  improvement?: HomeworkItemImprovementLevel
  completed: boolean
}

const improvementOptions: Array<{ value: HomeworkItemImprovementLevel; label: string }> = [
  { value: 'none', label: 'Not visible yet' },
  { value: 'small', label: 'Small' },
  { value: 'clear', label: 'Clear' },
  { value: 'big', label: 'Big' },
]

const stars: StarRating[] = [1, 2, 3, 4, 5]

export function TeacherPage() {
  const initialItems = localRepository.getHomeworkItems().filter((item) => item.status === 'active')
  const [items, setItems] = useState(initialItems)
  const [drafts, setDrafts] = useState<Record<string, EvaluationDraft>>(() => Object.fromEntries(initialItems.map((item) => [item.id, { homeworkItemId: item.id, completed: false }])))
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)

  const updateDraft = (itemId: string, changes: Partial<EvaluationDraft>) => {
    setDrafts((current) => ({ ...current, [itemId]: { ...current[itemId], ...changes } }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (submitted) return
    const incomplete = items.some((item) => !drafts[item.id].starRating || !drafts[item.id].improvement)
    if (incomplete) {
      setHasError(true)
      setMessage('Choose stars and an improvement level for every homework item.')
      return
    }

    const evaluations: HomeworkItemEvaluation[] = items.map((item) => {
      const draft = drafts[item.id]
      return { homeworkItemId: item.id, score: starRatingToPercentage(draft.starRating!), improvement: draft.improvement!, completed: draft.completed }
    })

    try {
      localRepository.saveLessonEvaluation(evaluations)
      const remaining = localRepository.getHomeworkItems().filter((item) => item.status === 'active')
      setItems(remaining)
      setDrafts(Object.fromEntries(remaining.map((item) => [item.id, { homeworkItemId: item.id, completed: false }])))
      setSubmitted(true)
      setHasError(false)
      setMessage(`Lesson evaluation saved. ${remaining.length} homework ${remaining.length === 1 ? 'item remains' : 'items remain'} active.`)
    } catch (caught) {
      setHasError(true)
      setMessage(caught instanceof Error ? caught.message : 'The lesson evaluation could not be saved.')
    }
  }

  return (
    <main className="teacher-page simplified-teacher-page">
      <div className="teacher-title"><p className="eyebrow">Teacher workspace</p><h2>Weekly lesson evaluation</h2><p>Choose one star rating and one improvement level for each homework item.</p></div>
      {submitted ? <><div className="form-message success teacher-confirmation" role="status">{message}</div>{items.length === 0 ? <div className="teacher-empty"><h3>No active homework.</h3><p>Everything from this lesson has been safely moved to history.</p></div> : <div className="teacher-empty"><h3>Carried forward to next lesson.</h3><ul>{items.map((item) => <li key={item.id}>{item.title}</li>)}</ul></div>}</> : items.length === 0 ? <div className="teacher-empty"><h3>No active homework.</h3><p>The parent can add homework items from the Parent view.</p></div> : (
        <form className="evaluation-workspace" onSubmit={handleSubmit}>
          <div className="evaluation-list">
            {items.map((item, index) => {
              const draft = drafts[item.id]
              return (
                <section className="homework-evaluation-card compact-evaluation-card" key={item.id}>
                  <header><span>{index + 1}</span><div><h3>{item.title}</h3>{item.section && <p>{item.section}</p>}{item.instruction && <p className="homework-instruction">{item.instruction}</p>}</div></header>
                  <div className="compact-evaluation-row">
                    <fieldset className="star-rating"><legend>Quality</legend><div className="star-buttons">{stars.map((star) => <button key={star} type="button" className={draft.starRating && star <= draft.starRating ? 'star-button selected' : 'star-button'} aria-label={`Rate homework quality ${star} out of 5 stars.`} aria-pressed={draft.starRating === star} onClick={() => updateDraft(item.id, { starRating: star })}><span aria-hidden="true">{draft.starRating && star <= draft.starRating ? '★' : '☆'}</span></button>)}</div><small>{draft.starRating ? `${draft.starRating} ${draft.starRating === 1 ? 'star' : 'stars'} · ${draft.starRating * 20}%` : 'Choose 1 to 5 stars'}</small></fieldset>
                    <fieldset className="improvement-selector"><legend>Improvement</legend><div>{improvementOptions.map((option) => <button key={option.value} type="button" className={draft.improvement === option.value ? 'improvement-button selected' : 'improvement-button'} aria-pressed={draft.improvement === option.value} onClick={() => updateDraft(item.id, { improvement: option.value })}>{option.label}</button>)}</div></fieldset>
                    <label className="completed-toggle"><input type="checkbox" checked={draft.completed} onChange={(event) => updateDraft(item.id, { completed: event.target.checked })} /><span>Completed</span></label>
                  </div>
                </section>
              )
            })}
          </div>
          <aside className="evaluation-summary"><div className="teacher-summary-card"><span>Homework items</span><strong>{items.length}</strong><small>Entered by parent</small></div><div className="teacher-summary-card"><span>Marked complete</span><strong>{items.filter((item) => drafts[item.id]?.completed).length}</strong><small>Will move to history</small></div>{message && <p className={hasError ? 'form-message error' : 'form-message success'} role={hasError ? 'alert' : 'status'}>{message}</p>}<button type="submit" className="primary-button" disabled={submitted || items.length === 0}>Save lesson evaluation</button></aside>
        </form>
      )}
    </main>
  )
}
