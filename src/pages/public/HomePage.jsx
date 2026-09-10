import { Link } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'
import { useProducts } from '../../hooks/useCatalogue'
import { formatProductPrice } from '../../utils/pricing'

export function HomePage() {
  const { business } = useBusiness()
  const { products, loading } = useProducts()
  const featured = products.filter((p) => p.imageUrls?.[0]).slice(0, 6)
  const showcase = featured.length ? featured : products.slice(0, 6)

  return (
    <div className="home">
      <section className="home-stage">
        <div className="home-stage__copy">
          <p className="home-kicker">Home bakery</p>
          <h1>{business.displayName}</h1>
          <p className="home-line">
            {business.description ||
              'Custom celebration cakes, brownies, and bento cakes — enquire in minutes.'}
          </p>
          <div className="home-actions">
            <Link className="btn btn-primary" to="/custom-cake">
              Start enquiry
            </Link>
            <Link className="btn btn-text" to="/menu">
              Browse menu
            </Link>
          </div>
          <p className="home-note">Preorder about {business.minimumPreorderDays || 4}–5 days · Pickup & delivery</p>
        </div>
      </section>

      <section className="home-strip">
        <div className="section-head">
          <h2>From the kitchen</h2>
          <Link to="/menu">Full menu</Link>
        </div>
        {loading ? <p className="muted">Loading…</p> : null}
        <div className="product-rail">
          {showcase.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="rail-card">
              <div className="rail-card__img">
                {product.imageUrls?.[0] ? (
                  <img src={product.imageUrls[0]} alt="" loading="lazy" />
                ) : (
                  <span>{product.name?.charAt(0)}</span>
                )}
              </div>
              <div className="rail-card__meta">
                <strong>{product.name}</strong>
                <span>{formatProductPrice(product)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-cta-band">
        <h2>Need something custom?</h2>
        <p>Share a theme, date, and reference — we’ll quote you on WhatsApp.</p>
        <Link className="btn btn-primary" to="/custom-cake">
          Custom cake enquiry
        </Link>
      </section>
    </div>
  )
}
