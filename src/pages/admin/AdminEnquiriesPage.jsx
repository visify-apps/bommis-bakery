import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { StatusBadge } from '../../components/admin/StatusBadge'
import { listEnquiries } from '../../services/firestore/adminEnquiries'
import { generateWhatsAppLink } from '../../services/whatsapp'
import { SIMPLE_STATUSES, toSimpleStatus } from '../../utils/simpleStatus'

export function AdminEnquiriesPage() {
  const [params, setParams] = useSearchParams()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const statusFilter = params.get('status') || ''

  useEffect(() => {
    let cancelled = false
    listEnquiries()
      .then((data) => {
        if (!cancelled) setEnquiries(data)
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
    return enquiries.filter((e) => {
      if (statusFilter && toSimpleStatus(e.status) !== statusFilter) return false
      if (!q) return true
      const hay = [
        e.enquiryNumber,
        e.customerSnapshot?.name,
        e.customerSnapshot?.phone,
        e.productName,
        e.requestType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [enquiries, statusFilter, search])

  function setStatus(value) {
    const next = new URLSearchParams(params)
    if (value) next.set('status', value)
    else next.delete('status')
    setParams(next)
  }

  return (
    <section className="page admin-page">
      <header className="page-header">
        <h1>Jobs</h1>
        <p className="lede">New requests and confirmed orders in one list.</p>
      </header>

      <input
        className="admin-search"
        type="search"
        placeholder="Search name, phone, ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="quick-filters" role="tablist" aria-label="Status">
        <button
          type="button"
          className={`quick-filter${!statusFilter ? ' is-active' : ''}`}
          onClick={() => setStatus('')}
        >
          All
        </button>
        {SIMPLE_STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`quick-filter${statusFilter === s.id ? ' is-active' : ''}`}
            onClick={() => setStatus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <p className="muted">Loading…</p> : null}
      {!loading && filtered.length === 0 ? <p className="muted">No jobs here.</p> : null}

      <div className="job-list">
        {filtered.map((enquiry) => {
          const phone = enquiry.customerSnapshot?.phone
          const wa = phone
            ? generateWhatsAppLink(
                phone,
                `Hi ${enquiry.customerSnapshot?.name || ''}, regarding ${enquiry.enquiryNumber}…`,
              )
            : null
          return (
            <article key={enquiry.id} className="job-card">
              <Link to={`/admin/enquiries/${enquiry.id}`} className="job-card__main">
                <div>
                  <strong>{enquiry.customerSnapshot?.name || enquiry.enquiryNumber}</strong>
                  <p>
                    {enquiry.productName || enquiry.requestType}
                    {enquiry.preferredDateLabel ? ` · ${enquiry.preferredDateLabel}` : ''}
                  </p>
                </div>
                <StatusBadge status={enquiry.status} />
              </Link>
              <div className="job-card__actions">
                <Link className="btn btn-secondary btn-small" to={`/admin/enquiries/${enquiry.id}`}>
                  Open
                </Link>
                {wa && wa !== '#' ? (
                  <a className="btn btn-primary btn-small" href={wa} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
