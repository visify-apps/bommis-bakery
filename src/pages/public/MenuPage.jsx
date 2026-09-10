import { Link } from 'react-router-dom'
import { useCategories, useProducts } from '../../hooks/useCatalogue'
import { ProductCard } from '../../components/customer/ProductCard'
import { getCategoryName } from '../../services/firestore/catalogue'

export function MenuPage() {
  const { categories, loading: catsLoading } = useCategories()
  const { products, loading: productsLoading } = useProducts()
  const loading = catsLoading || productsLoading

  return (
    <section className="page menu-page">
      <header className="section-intro">
        <h1>Menu</h1>
        <p>Pick an item to enquire — custom cakes are quoted after we review your details.</p>
      </header>

      {loading ? <p className="muted">Loading…</p> : null}

      {!loading && (
        <>
          <nav className="menu-tabs" aria-label="Categories">
            {categories.map((cat) => (
              <a key={cat.id} href={`#cat-${cat.id}`}>
                {cat.name}
              </a>
            ))}
          </nav>

          {categories.map((cat) => {
            const items = products.filter((p) => p.categoryId === cat.id)
            if (!items.length) return null
            return (
              <section key={cat.id} id={`cat-${cat.id}`} className="menu-block">
                <h2>{cat.name}</h2>
                <div className="product-grid">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={getCategoryName(categories, product.categoryId)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </>
      )}

      <div className="menu-end">
        <Link className="btn btn-primary" to="/custom-cake">
          Custom cake enquiry
        </Link>
      </div>
    </section>
  )
}
