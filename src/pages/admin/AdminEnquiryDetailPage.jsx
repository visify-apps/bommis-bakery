import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../../components/admin/StatusBadge'
import {
  computeBalance,
  getEnquiry,
  updateEnquiry,
} from '../../services/firestore/adminEnquiries'
import { upsertCustomerFromEnquiry } from '../../services/firestore/customers'
import { createOrderFromEnquiry } from '../../services/firestore/orders'
import { getProduct } from '../../services/firestore/catalogue'
import {
  buildQuotationMessage,
  generateWhatsAppLink,
} from '../../services/whatsapp'
import { formatPrice } from '../../utils/pricing'
import { canAutoPrice } from '../../utils/autoPrice'
import {
  SIMPLE_STATUSES,
  simpleStatusMeta,
  storeStatusFromSimple,
  toSimpleStatus,
} from '../../utils/simpleStatus'

export function AdminEnquiryDetailPage() {
  const { id } = useParams()
  const [enquiry, setEnquiry] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [simpleStatus, setSimpleStatus] = useState('NEW')
  const [quotedPrice, setQuotedPrice] = useState('')
  const [advanceRequired, setAdvanceRequired] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getEnquiry(id)
      .then(async (data) => {
        if (cancelled) return
        setEnquiry(data)
        if (data) {
          setSimpleStatus(toSimpleStatus(data.status))
          setNote(data.internalNotes || '')
          setQuotedPrice(data.quotedPrice != null ? String(data.quotedPrice) : '')
          setAdvanceRequired(data.advanceRequired != null ? String(data.advanceRequired) : '')
          if (data.productId) {
            const p = await getProduct(data.productId)
            if (!cancelled) setProduct(p)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const balance = useMemo(
    () => computeBalance(quotedPrice, advanceRequired),
    [quotedPrice, advanceRequired],
  )

  const autoPriced = Boolean(
    enquiry?.priceLocked ||
      (product && canAutoPrice(product) && enquiry?.quotedPrice != null) ||
      enquiry?.autoPriced,
  )

  const customerPhone = enquiry?.customerSnapshot?.phone
  const customerFirstName = enquiry?.customerSnapshot?.name?.split(' ')[0] || 'there'
  const statusMeta = simpleStatusMeta(simpleStatus)

  async function savePatch(patch) {
    setSaving(true)
    setError('')
    try {
      const updated = await updateEnquiry(enquiry.id, patch)
      setEnquiry(updated)
      if (patch.status) setSimpleStatus(toSimpleStatus(patch.status))
    } catch (err) {
      setError(err?.message || 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusSave() {
    await savePatch({ status: storeStatusFromSimple(simpleStatus) })
  }

  async function handleQuoteSave() {
    const quote = Number(quotedPrice)
    const advance = Number(advanceRequired) || 0
    if (Number.isNaN(quote) || quote < 0) {
      setError('Enter a valid price.')
      return
    }
    await savePatch({
      quotedPrice: quote,
      advanceRequired: advance,
      balanceAmount: computeBalance(quote, advance),
      status: 'QUOTE_SENT',
      quoteSentAt: new Date().toISOString(),
    })
  }

  async function handleConfirmOrder() {
    setSaving(true)
    setError('')
    try {
      await upsertCustomerFromEnquiry(enquiry)
      await createOrderFromEnquiry({
        ...enquiry,
        status: 'CONFIRMED',
        quotedPrice: Number(quotedPrice) || enquiry.quotedPrice || 0,
        advanceRequired: Number(advanceRequired) || enquiry.advanceRequired || 0,
        balanceAmount: balance,
      })
      const refreshed = await getEnquiry(enquiry.id)
      setEnquiry(refreshed)
      setSimpleStatus(toSimpleStatus(refreshed?.status))
    } catch (err) {
      setError(err?.message || 'Could not confirm order.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="page admin-page">
        <p className="muted">Loading…</p>
      </section>
    )
  }

  if (!enquiry) {
    return (
      <section className="page admin-page">
        <h1>Not found</h1>
        <Link className="btn btn-secondary" to="/admin/enquiries">
          Back
        </Link>
      </section>
    )
  }

  const quoteMessage = buildQuotationMessage(
    {
      enquiryNumber: enquiry.enquiryNumber,
      quotedPrice: quotedPrice || enquiry.quotedPrice || 0,
      advanceRequired: advanceRequired || enquiry.advanceRequired || 0,
      balanceAmount: balance,
    },
    { customerFirstName },
  )
  const quoteWa = customerPhone ? generateWhatsAppLink(customerPhone, quoteMessage) : null
  const openWa = customerPhone
    ? generateWhatsAppLink(
        customerPhone,
        `Hi ${customerFirstName}, regarding enquiry ${enquiry.enquiryNumber}…`,
      )
    : null

  return (
    <section className="page admin-page admin-enquiry-detail">
      <Link className="back-link" to="/admin/enquiries">
        ← Jobs
      </Link>

      <div className="job-detail-head">
        <div>
          <h1>{enquiry.customerSnapshot?.name || 'Customer'}</h1>
          <p className="muted">{enquiry.enquiryNumber}</p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-detail-layout">
        <section className="admin-panel">
          <h2>Request</h2>
          <p>
            <strong>{enquiry.productName || enquiry.requestType}</strong>
            {enquiry.occasion ? ` · ${enquiry.occasion}` : ''}
          </p>
          <p className="muted">
            {enquiry.preferredDateLabel || enquiry.preferredDate}
            {enquiry.flavour ? ` · ${enquiry.flavour}` : ''}
            {enquiry.cakeSize ? ` · ${enquiry.cakeSize}` : ''}
            {enquiry.servings ? ` · Qty ${enquiry.servings}` : ''}
          </p>
          {enquiry.otherRequirements ? <p>{enquiry.otherRequirements}</p> : null}
          <p className="muted">
            {enquiry.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'} ·{' '}
            {enquiry.customerSnapshot?.phone}
          </p>
        </section>

        <section className="admin-panel">
          <h2>Where is this job?</h2>
          <p className="muted status-hint">{statusMeta.hint}</p>
          <div className="status-choice">
            {SIMPLE_STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`status-choice__btn${simpleStatus === s.id ? ' is-active' : ''}`}
                onClick={() => setSimpleStatus(s.id)}
              >
                <strong>{s.label}</strong>
                <span>{s.hint}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            disabled={saving}
            onClick={handleStatusSave}
          >
            Save status
          </button>
        </section>

        <section className="admin-panel">
          <h2>Price</h2>
          {autoPriced ? (
            <>
              <p className="price-locked">
                {formatPrice(Number(quotedPrice) || enquiry.quotedPrice) || '—'}
              </p>
              <p className="muted">
                Filled from menu price × quantity. No extra quote needed.
              </p>
              {quoteWa && quoteWa !== '#' ? (
                <a className="btn btn-secondary btn-small" href={quoteWa} target="_blank" rel="noreferrer">
                  Share price on WhatsApp
                </a>
              ) : null}
            </>
          ) : (
            <div className="enquiry-fields">
              <label className="enquiry-field">
                <span>Total (₹)</span>
                <input
                  inputMode="decimal"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                />
              </label>
              <label className="enquiry-field">
                <span>Advance (₹)</span>
                <input
                  inputMode="decimal"
                  value={advanceRequired}
                  onChange={(e) => setAdvanceRequired(e.target.value)}
                />
              </label>
              <p>
                Balance: <strong>{formatPrice(balance) || `₹${balance}`}</strong>
              </p>
              <div className="cta-row">
                <button type="button" className="btn btn-primary btn-small" disabled={saving} onClick={handleQuoteSave}>
                  Save & mark Quoted
                </button>
                {quoteWa && quoteWa !== '#' ? (
                  <a className="btn btn-secondary btn-small" href={quoteWa} target="_blank" rel="noreferrer">
                    WhatsApp quote
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </section>

        <section className="admin-panel">
          <h2>Private notes</h2>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          <button
            type="button"
            className="btn btn-secondary btn-small"
            style={{ marginTop: '0.75rem' }}
            disabled={saving}
            onClick={() => savePatch({ internalNotes: note })}
          >
            Save notes
          </button>
        </section>
      </div>

      <div className="admin-sticky-actions">
        {openWa && openWa !== '#' ? (
          <a className="btn btn-primary" href={openWa} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={saving || Boolean(enquiry.orderId)}
          onClick={handleConfirmOrder}
        >
          {enquiry.orderId ? 'Confirmed' : 'Confirm order'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={saving}
          onClick={() => savePatch({ status: 'COMPLETED' })}
        >
          Done
        </button>
      </div>
    </section>
  )
}
