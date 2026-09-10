import { Link, useParams } from 'react-router-dom'
import { useCategories, useProduct } from '../../hooks/useCatalogue'
import { formatProductPrice } from '../../utils/pricing'
import { getCategoryName } from '../../services/firestore/catalogue'
import { useBusiness } from '../../context/BusinessContext'

export function ProductDetailPage() {
  const { productId } = useParams()
  const { product, loading } = useProduct(productId)
  const { categories } = useCategories()
  const { business } = useBusiness()

  if (loading) {
    return (
      <section className="page">
        <p className="muted">Loading…</p>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="page">
        <h1>Not found</h1>
        <Link className="btn btn-secondary" to="/menu">
          Menu
        </Link>
      </section>
    )
  }

  const priceLabel = formatProductPrice(product, business.currency || 'INR')
  const categoryName = getCategoryName(categories, product.categoryId)
  const images = product.imageUrls || []

  return (
    <section className="page product-detail">
      <div className="product-detail__grid">
        <div className="product-detail__media">
          {images[0] ? (
            <img src={images[0]} alt={product.name} />
          ) : (
            <div className="product-detail__placeholder">{product.name?.charAt(0)}</div>
          )}
          {images.length > 1 ? (
            <div className="product-detail__thumbs">
              {images.slice(1).map((url, i) => (
                <img key={i} src={url} alt="" />
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <p className="eyebrow">{categoryName}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__price">{priceLabel}</p>
          {product.minimumQuantity ? (
            <p className="muted">Min. {product.minimumQuantity} pieces</p>
          ) : null}
          <p className="home-line">{product.description}</p>
          <div className="home-actions">
            <Link className="btn btn-primary" to={`/custom-cake?product=${product.id}`}>
              Enquire about this
            </Link>
            <Link className="btn btn-text" to="/menu">
              Back to menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
