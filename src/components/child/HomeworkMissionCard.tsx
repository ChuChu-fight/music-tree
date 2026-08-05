import type { HomeworkItem } from '../../domain/types'

export function HomeworkMissionCard({ items }: { items: HomeworkItem[] }) {
  return <section className="child-card mission-card"><span className="child-card-icon" aria-hidden="true">♪</span><div><p className="child-kicker">Your music mission</p><h2>Play these this week</h2><ol>{items.map((item) => <li key={item.id}><strong>{item.title}</strong>{item.section && <span>{item.section}</span>}{item.instruction && <small>{item.instruction}</small>}</li>)}</ol></div></section>
}
