import { simpleStatusMeta } from '../../utils/simpleStatus'

export function StatusBadge({ status }) {
  const meta = simpleStatusMeta(status)
  return (
    <span className={`status-badge status-${meta.id.toLowerCase()}`}>
      {meta.label}
    </span>
  )
}
