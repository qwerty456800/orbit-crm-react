type StatCardProps = {
  title: string
  icon: string
  trend: string
  value: number | string
  description: string
}

function StatCard(props: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">{props.icon}</span>
        <span className="trend">{props.trend}</span>
      </div>
      <p>{props.title}</p>
      <div className="stat-value">{props.value}</div>
      <small>{props.description}</small>
    </article>
  )
}
export default StatCard
