import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { useAccess } from '../context/AccessContext'
import { generateWhatsAppLink } from '../services/whatsapp'

export function PublicLayout() {
  const { business } = useBusiness()
  const { pathname } = useLocation()
  const focused =
    pathname.startsWith('/custom-cake') || pathname.startsWith('/products/')
  const { access } = useAccess()
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
          {access.open ? <NavLink to="/custom-cake">Enquire</NavLink> : null}
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
            {business.instagramHandle || business.instagramUrl ? (
              <a
                href={
                  business.instagramUrl ||
                  `https://www.instagram.com/${String(business.instagramHandle).replace(/^@/, '')}/`
                }
                target="_blank"
                rel="noreferrer"
              >
                @
                {String(business.instagramHandle || 'bommis__bakery')
                  .replace(/^@/, '')
                  .replace(/.*instagram\.com\//, '')
                  .replace(/\/.*/, '')}
              </a>
            ) : (
              `${business.minimumPreorderDays || 3} days preorder · RS Puram, Coimbatore`
            )}
          </p>
        </footer>
      ) : null}
    </div>
  )
}
