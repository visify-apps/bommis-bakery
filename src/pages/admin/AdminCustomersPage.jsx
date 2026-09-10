import { useEffect, useMemo, useState } from 'react'
import { listCustomers } from '../../services/firestore/customers'
import { formatPrice } from '../../utils/pricing'
import { generateWhatsAppLink } from '../../services/whatsapp'

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    listCustomers()
      .then((data) => {
        if (!cancelled) setCustomers(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) =>
      [c.name, c.phone, c.email].filter(Boolean).join(' ').toLowerCase().includes(q),
    )
  }, [customers, search])

  return (
    <section className="page">
      <header className="page-header">
        <h1>Customers</h1>
      </header>

      <input
        className="admin-search"
        type="search"
        placeholder="Search name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? <p className="muted">Loading…</p> : null}

      <div className="job-list">
        {filtered.map((customer) => {
          const wa = generateWhatsAppLink(customer.phone, `Hi ${customer.name?.split(' ')[0] || ''}…`)
          return (
            <article key={customer.id} className="job-card">
              <div className="job-card__main">
                <div>
                  <strong>{customer.name}</strong>
                  <p>{customer.phone}</p>
                  <p className="muted">
                    {customer.totalEnquiries ?? 0} enquiries · {formatPrice(customer.totalSpend) || '₹0'}
                  </p>
                </div>
              </div>
              {wa !== '#' ? (
                <div className="job-card__actions">
                  <a className="btn btn-primary btn-small" href={wa} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
