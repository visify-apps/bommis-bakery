import { Link } from 'react-router-dom'
import { formatProductPrice } from '../../utils/pricing'

export function ProductCard({ product }) {
  const priceLabel = formatProductPrice(product)
  const image = product.imageUrls?.[0]

  return (
    <article className="p-card">
      <Link to={`/products/${product.id}`} className="p-card__media">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="p-card__empty">{product.name?.charAt(0)}</div>
        )}
      </Link>
      <div className="p-card__body">
        <h3>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="p-card__price">{priceLabel}</p>
        <Link className="p-card__cta" to={`/custom-cake?product=${product.id}`}>
          Enquire →
        </Link>
      </div>
    </article>
  )
}
