import { NavLink, Outlet } from 'react-router-dom'
import { useBusiness } from '../context/BusinessContext'
import { generateWhatsAppLink } from '../services/whatsapp'

export function PublicLayout() {
  const { business } = useBusiness()
  const phone = business.whatsappNumber || business.phone
  const wa = phone
    ? generateWhatsAppLink(phone, `Hi ${business.displayName || ''}, I'd like to ask about a cake.`)
    : null

  return (
    <div className="site">
      <header className="site-header">
        <NavLink to="/" className="site-logo">
          {business.displayName || business.businessName}
        </NavLink>
        <nav className="site-nav" aria-label="Primary">
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/custom-cake">Custom cake</NavLink>
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
      <footer className="site-footer">
        <p className="site-footer__brand">{business.displayName}</p>
        <p>
          {business.instagramHandle
            ? `@${business.instagramHandle.replace(/^@/, '')}`
            : 'Handmade cakes · Preorder 4–5 days'}
        </p>
      </footer>
    </div>
  )
}
