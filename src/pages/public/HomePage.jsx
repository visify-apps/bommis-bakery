import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'
import { useAccess } from '../../context/AccessContext'
import { useProducts } from '../../hooks/useCatalogue'
import { ShopCard } from '../../components/customer/ShopCard'
import { AFTER_ENQUIRY_HOME_KEY } from '../../services/whatsapp'
import { customerClosedMessage } from '../../utils/subscription'

export function HomePage() {
  const { business } = useBusiness()
  const { access } = useAccess()

  useEffect(() => {
    try {
      sessionStorage.removeItem(AFTER_ENQUIRY_HOME_KEY)
    } catch {
      // ignore
    }
  }, [])
  const { products, loading } = useProducts()
  const days = business.minimumPreorderDays || 3
  const withPhoto = products.filter((p) => p.imageUrls?.[0])
  const showcase = (withPhoto.length ? withPhoto : products).slice(0, 6)
  const ig = business.instagramHandle || business.instagramUrl || ''

  return (
    <div className="shop-home">
      <section className="shop-hero">
        <p className="shop-hero__kicker">Home bakery · RS Puram, Coimbatore</p>
        <h1>{business.displayName || "Bommi's Bakery"}</h1>
        <p className="shop-hero__line">
          Big celebration cakes, fondant themes, and baking classes — order the way you already
          message on Instagram, just clearer.
        </p>
        <div className="shop-hero__actions">
          {access.open ? (
            <Link className="btn btn-primary" to="/custom-cake">
              Place a cake order
            </Link>
          ) : (
            <p className="shop-hero__note">{customerClosedMessage()}</p>
          )}
          <Link className="btn btn-secondary" to="/menu">
            Cakes & classes
          </Link>
        </div>
        <p className="shop-hero__note">
          {days} days notice · Pickup or delivery ·{' '}
          {ig ? `@${String(ig).replace(/^@/, '').replace(/.*instagram\.com\//, '').replace(/\/.*/, '')}` : 'FSSAI registered'}
        </p>
      </section>

      <section className="page shop-page shop-home__menu">
        <div className="shop-section-head">
          <h2>From the bakery</h2>
          <Link to="/menu">Full menu</Link>
        </div>
        {loading ? <p className="muted">Loading…</p> : null}
        <div className="shop-grid">
          {showcase.map((product) => (
            <ShopCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
