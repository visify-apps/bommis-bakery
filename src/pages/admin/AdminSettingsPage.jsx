import { Link } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'
import { appConfig } from '../../config/appConfig'

export function AdminSettingsPage() {
  const { business, loading } = useBusiness()

  return (
    <section className="page">
      <Link className="back-link" to="/admin/more">
        ← More
      </Link>
      <h1>Settings</h1>
      {loading ? <p className="muted">Loading…</p> : null}

      <div className="admin-panel" style={{ marginTop: '1rem' }}>
        <dl className="review-list">
          <div className="review-row">
            <dt>Bakery</dt>
            <dd>{business.displayName}</dd>
          </div>
          <div className="review-row">
            <dt>WhatsApp</dt>
            <dd>{business.whatsappNumber || business.phone || '—'}</dd>
          </div>
          <div className="review-row">
            <dt>Preorder</dt>
            <dd>{business.minimumPreorderDays ?? 4} days</dd>
          </div>
          <div className="review-row">
            <dt>Business ID</dt>
            <dd>{business.businessId || appConfig.defaultBusinessId}</dd>
          </div>
        </dl>
        <p className="muted">
          Edit these in Firebase Console → Firestore → settings/general and settings/orderRules.
        </p>
      </div>
    </section>
  )
}
