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
  const days = business.minimumPreorderDays || 4
  const withPhoto = products.filter((p) => p.imageUrls?.[0])
  const showcase = (withPhoto.length ? withPhoto : products).slice(0, 6)

  return (
    <div className="shop-home">
      <section className="shop-hero">
        <p className="shop-hero__kicker">Home bakery</p>
        <h1>{business.displayName}</h1>
        <p className="shop-hero__line">
          Celebration cakes, brownies, and bento — tell us the date, we’ll bake it with care.
        </p>
        <div className="shop-hero__actions">
          {access.open ? (
            <Link className="btn btn-primary" to="/custom-cake">
              Start an enquiry
            </Link>
          ) : (
            <p className="shop-hero__note">{customerClosedMessage()}</p>
          )}
          <Link className="btn btn-secondary" to="/menu">
            See the menu
          </Link>
        </div>
        <p className="shop-hero__note">{days} days preorder · Pickup · Delivery on request</p>
      </section>

      <section className="page shop-page shop-home__menu">
        <div className="shop-section-head">
          <h2>Loved this week</h2>
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
