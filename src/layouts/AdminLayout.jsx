import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../context/BusinessContext'

const links = [
  { to: '/admin', end: true, label: 'Today' },
  { to: '/admin/enquiries', label: 'Jobs' },
  { to: '/admin/products', label: 'Menu' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/settings', label: 'Settings' },
]

const mobileTabs = [
  { to: '/admin', end: true, label: 'Today' },
  { to: '/admin/enquiries', label: 'Jobs' },
  { to: '/admin/products', label: 'Menu' },
  { to: '/admin/more', label: 'More' },
]

export function AdminLayout() {
  const { business } = useBusiness()
  const { logout, user } = useAuth()
  const location = useLocation()
  const onDetail = location.pathname.includes('/enquiries/')

  return (
    <div className={`admin-shell${onDetail ? ' admin-shell--detail' : ''}`}>
      <aside className="admin-rail" aria-label="Admin navigation">
        <div className="admin-rail__brand">
          <strong>{business.displayName || 'Bakery'}</strong>
          <span>Admin</span>
        </div>
        <nav className="admin-rail__nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-rail__foot">
          <p className="muted">{user?.email}</p>
          <button type="button" className="btn btn-ghost" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar admin-topbar--mobile">
          <div>
            <strong>{business.displayName || 'Bakery'}</strong>
            <span className="admin-topbar__sub">Manage orders</span>
          </div>
          <button type="button" className="btn btn-ghost admin-signout" onClick={() => logout()}>
            Sign out
          </button>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

      {!onDetail ? (
        <nav className="admin-tabbar" aria-label="Admin mobile">
          {mobileTabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className="admin-tab">
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
