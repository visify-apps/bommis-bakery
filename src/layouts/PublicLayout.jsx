import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { generateWhatsAppLink } from '../services/whatsapp'

export function PublicLayout() {
  const { business } = useBusiness()
  const { pathname } = useLocation()
  const focused =
    pathname.startsWith('/custom-cake') || pathname.startsWith('/products/')
  const phone = business.whatsappNumber || business.phone
  const wa = phone
    ? generateWhatsAppLink(phone, `Hi ${business.displayName || ''}, I'd like to ask about a cake.`)
    : null

  return (
    <div className={`site${focused ? ' site--focus' : ''}`}>
      <header className="site-header">
        <NavLink to="/" className="site-logo">
          {business.displayName || business.businessName}
        </NavLink>
        <nav className="site-nav" aria-label="Primary">
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/custom-cake">Enquire</NavLink>
          {wa && wa !== '#' ? (
            <a href={wa} target="_blank" rel="noreferrer" className="site-nav__wa">
              WhatsApp
            </a>
          ) : null}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      {!focused ? (
        <footer className="site-footer">
          <p>
            {business.instagramHandle
              ? `@${business.instagramHandle.replace(/^@/, '')}`
              : `${business.minimumPreorderDays || 4} days preorder`}
          </p>
        </footer>
      ) : null}
    </div>
  )
}
