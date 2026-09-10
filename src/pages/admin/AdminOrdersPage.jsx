import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listOrders, updateOrder } from '../../services/firestore/orders'
import { StatusBadge } from '../../components/admin/StatusBadge'
import { formatPrice } from '../../utils/pricing'
import { SIMPLE_PAYMENT } from '../../utils/simpleStatus'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState(null)

  async function refresh() {
    setOrders(await listOrders())
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      [o.orderNumber, o.enquiryNumber, o.customerSnapshot?.name, o.customerSnapshot?.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [orders, search])

  async function handlePaymentChange(orderId, paymentStatus) {
    setSavingId(orderId)
    try {
      await updateOrder(orderId, { paymentStatus })
      await refresh()
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1>Orders</h1>
        <p className="lede">Accepted jobs after you confirm an enquiry.</p>
      </header>

      <input
        className="admin-search"
        type="search"
        placeholder="Search order or customer"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? <p className="muted">Loading…</p> : null}

      <div className="job-list">
        {filtered.map((order) => (
          <article key={order.id} className="job-card">
            <div className="job-card__main">
              <div>
                <strong>{order.orderNumber}</strong>
                <p>
                  {order.customerSnapshot?.name} ·{' '}
                  <Link to={`/admin/enquiries/${order.enquiryId}`}>{order.enquiryNumber}</Link>
                </p>
                <p className="muted">
                  {formatPrice(order.quotedPrice)} · {String(order.deliveryDate || '').slice(0, 10)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="job-card__actions">
              <select
                value={order.paymentStatus || 'UNPAID'}
                disabled={savingId === order.id}
                onChange={(e) => handlePaymentChange(order.id, e.target.value)}
              >
                {SIMPLE_PAYMENT.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <p className="muted">No orders yet. Open a job and tap Confirm order.</p>
      ) : null}
    </section>
  )
}
