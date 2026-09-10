import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminMorePage() {
  const { user, logout } = useAuth()

  return (
    <section className="page admin-more">
      <h1>More</h1>
      <p className="muted">{user?.email}</p>

      <div className="admin-more-list">
        <Link to="/admin/orders">Orders (accepted jobs)</Link>
        <Link to="/admin/customers">Customers</Link>
        <Link to="/admin/settings">Settings</Link>
        <a href="#/" target="_blank" rel="noreferrer">
          Open customer website
        </a>
        <button type="button" onClick={() => logout()}>
          Sign out
        </button>
      </div>
    </section>
  )
}
