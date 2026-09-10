import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listEnquiries,
  summarizeEnquiries,
} from '../../services/firestore/adminEnquiries'
import { StatusBadge } from '../../components/admin/StatusBadge'
import { generateWhatsAppLink } from '../../services/whatsapp'

export function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [newJobs, setNewJobs] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listEnquiries()
      .then((items) => {
        if (cancelled) return
        const s = summarizeEnquiries(items)
        setSummary(s)
        setNewJobs(items.filter((e) => e.status === 'NEW').slice(0, 8))
        setUpcoming(s.upcomingDates || [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="page admin-today">
      <h1>Today</h1>
      <p className="lede">New requests and upcoming cake dates — tap a job to manage it.</p>

      {loading ? <p className="muted">Loading…</p> : null}

      {summary ? (
        <div className="stat-grid stat-grid--mobile">
          <Link to="/admin/enquiries?status=NEW" className="stat-card stat-card--link">
            <span>New</span>
            <strong>{summary.newCount}</strong>
          </Link>
          <Link to="/admin/enquiries" className="stat-card stat-card--link">
            <span>Need quote</span>
            <strong>{summary.pendingQuotes}</strong>
          </Link>
          <div className="stat-card">
            <span>Upcoming</span>
            <strong>{summary.upcomingOrders}</strong>
          </div>
        </div>
      ) : null}

      <section className="admin-panel admin-panel--flush">
        <div className="admin-panel__head">
          <h2>New enquiries</h2>
          <Link to="/admin/enquiries">See all</Link>
        </div>
        {!newJobs.length && !loading ? <p className="muted">No new enquiries.</p> : null}
        <div className="job-list">
          {newJobs.map((enquiry) => {
            const phone = enquiry.customerSnapshot?.phone
            const wa = phone
              ? generateWhatsAppLink(
                  phone,
                  `Hi ${enquiry.customerSnapshot?.name?.split(' ')[0] || ''}, regarding ${enquiry.enquiryNumber}…`,
                )
              : null
            return (
              <article key={enquiry.id} className="job-card">
                <Link to={`/admin/enquiries/${enquiry.id}`} className="job-card__main">
                  <div>
                    <strong>{enquiry.customerSnapshot?.name || 'Customer'}</strong>
                    <p>
                      {enquiry.productName || enquiry.requestType} ·{' '}
                      {enquiry.preferredDateLabel || enquiry.preferredDate}
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

      <section className="admin-panel admin-panel--flush">
        <div className="admin-panel__head">
          <h2>Upcoming dates</h2>
        </div>
        {!upcoming.length && !loading ? <p className="muted">Nothing upcoming.</p> : null}
        <ul className="plain-list">
          {upcoming.map((e) => (
            <li key={e.id}>
              <Link to={`/admin/enquiries/${e.id}`}>{e.preferredDateLabel || e.preferredDate}</Link>
              {' — '}
              {e.customerSnapshot?.name} ({e.enquiryNumber})
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
