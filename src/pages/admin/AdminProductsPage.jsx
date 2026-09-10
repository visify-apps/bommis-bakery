import { useEffect, useState } from 'react'
import {
  listAdminProducts,
  saveProduct,
  setProductAvailability,
} from '../../services/firestore/adminProducts'
import { seedCategories } from '../../data/seedCatalogue'
import { PRICE_TYPES } from '../../types/enums'
import { formatProductPrice } from '../../utils/pricing'
import { compressImageFile } from '../../utils/imageCompress'

const emptyForm = {
  id: '',
  name: '',
  categoryId: 'fresh-cream',
  description: '',
  basePrice: '',
  priceType: 'starting_from',
  minimumQuantity: '',
  available: true,
  requiresCustomEnquiry: false,
  displayOrder: 99,
  imageUrls: [],
}

export function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  async function refresh() {
    setProducts(await listAdminProducts())
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  function startEdit(product) {
    setEditingId(product.id)
    setShowForm(true)
    setForm({
      id: product.id,
      name: product.name || '',
      categoryId: product.categoryId || 'fresh-cream',
      description: product.description || '',
      basePrice: product.basePrice ?? '',
      priceType: product.priceType || 'enquiry',
      minimumQuantity: product.minimumQuantity ?? '',
      available: product.available !== false,
      requiresCustomEnquiry: Boolean(product.requiresCustomEnquiry),
      displayOrder: product.displayOrder ?? 0,
      imageUrls: product.imageUrls || [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError('')
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(false)
  }

  async function handleImagePick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const dataUrl = await compressImageFile(file)
      setForm((f) => ({
        ...f,
        imageUrls: [dataUrl, ...(f.imageUrls || []).slice(0, 2)],
      }))
    } catch (err) {
      setError(err?.message || 'Could not process image.')
    } finally {
      setUploading(false)
    }
  }

  function removeImage(index) {
    setForm((f) => ({
      ...f,
      imageUrls: (f.imageUrls || []).filter((_, i) => i !== index),
    }))
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await saveProduct(form)
      await refresh()
      resetForm()
    } catch (err) {
      setError(err?.message || 'Could not save product.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable(product) {
    await setProductAvailability(product.id, !product.available)
    await refresh()
  }

  return (
    <section className="page">
      <header className="admin-page-header">
        <div>
          <h1>Menu</h1>
          <p className="lede">Add photos and edit items customers see.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          Add item
        </button>
      </header>

      {showForm ? (
        <form className="admin-panel stack-form" onSubmit={handleSave}>
          <h2>{editingId ? 'Edit item' : 'New item'}</h2>

          <div className="product-image-editor">
            <div className="product-image-editor__grid">
              {(form.imageUrls || []).map((url, index) => (
                <div key={index} className="product-image-thumb">
                  <img src={url} alt="" />
                  <button type="button" onClick={() => removeImage(index)}>
                    Remove
                  </button>
                </div>
              ))}
              {(form.imageUrls || []).length < 3 ? (
                <label className="product-image-add">
                  <span>{uploading ? 'Processing…' : '+ Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    disabled={uploading}
                    onChange={handleImagePick}
                  />
                </label>
              ) : null}
            </div>
            <p className="muted">Photos are compressed and saved with the product (no paid Storage).</p>
          </div>

          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label>
            Category
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              {seedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label>
            Price type
            <select
              value={form.priceType}
              onChange={(e) => setForm((f) => ({ ...f, priceType: e.target.value }))}
            >
              {PRICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Base price (₹)
            <input
              inputMode="decimal"
              value={form.basePrice}
              onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
            />
          </label>
          <label>
            Minimum quantity
            <input
              inputMode="numeric"
              value={form.minimumQuantity}
              onChange={(e) => setForm((f) => ({ ...f, minimumQuantity: e.target.value }))}
            />
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.requiresCustomEnquiry}
              onChange={(e) => setForm((f) => ({ ...f, requiresCustomEnquiry: e.target.checked }))}
            />
            Needs custom cake details
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
            />
            Show on menu
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <div className="cta-row">
            <button className="btn btn-primary" type="submit" disabled={saving || uploading}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? <p className="muted">Loading…</p> : null}

      <div className="menu-admin-grid">
        {products.map((product) => (
          <article key={product.id} className="menu-admin-card">
            <div className="menu-admin-card__media">
              {product.imageUrls?.[0] ? (
                <img src={product.imageUrls[0]} alt="" />
              ) : (
                <div className="product-card__placeholder">
                  <span>{product.name?.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="menu-admin-card__body">
              <strong>{product.name}</strong>
              <p className="muted">
                {formatProductPrice(product)}
                {!product.available ? ' · Hidden' : ''}
              </p>
              <div className="job-card__actions">
                <button type="button" className="btn btn-secondary btn-small" onClick={() => startEdit(product)}>
                  Edit
                </button>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => toggleAvailable(product)}>
                  {product.available ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
