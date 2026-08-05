export function RecentRewardCard({ message }: { message: string }) {
  return <section className="child-card compact-child-card reward-milestone"><span className="child-card-icon" aria-hidden="true">❄</span><div><p className="child-kicker">Tree magic</p><h2>Something lovely happened</h2><p>{message}</p></div></section>
}
