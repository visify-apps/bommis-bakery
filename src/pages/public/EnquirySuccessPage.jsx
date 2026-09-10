import { Link, useSearchParams } from 'react-router-dom'
import { useBusiness } from '../../context/BusinessContext'
import { readEnquirySuccessPayload } from '../../services/firestore/enquiries'
import {
  buildEnquiryContinuationMessage,
  generateWhatsAppLink,
} from '../../services/whatsapp'

function eggLabel(value) {
  if (value === 'eggless') return 'Eggless'
  if (value === 'egg') return 'With egg'
  return value || '—'
}

export function EnquirySuccessPage() {
  const [params] = useSearchParams()
  const { business } = useBusiness()
  const enquiryNumber = params.get('enquiry')
  const stored = readEnquirySuccessPayload()

  const enquiry = stored?.enquiry && stored.enquiryNumber === enquiryNumber ? stored.enquiry : null

  const message = buildEnquiryContinuationMessage(
    {
      enquiryNumber: enquiryNumber || enquiry?.enquiryNumber,
      requestType: enquiry?.requestType,
      occasion: enquiry?.occasion,
      preferredDateLabel: enquiry?.preferredDateLabel,
      flavour: enquiry?.flavour,
      cakeSize: enquiry?.cakeSize,
      eggPreference: eggLabel(enquiry?.eggPreference),
      referenceFileName: enquiry?.referenceFileName,
      referenceDeferredToWhatsApp: enquiry?.referenceDeferredToWhatsApp,
    },
    {
      displayName: business.displayName,
      whatsappGreetingName: business.whatsappGreetingName || 'Keerthana',
    },
  )

  const bakeryPhone = business.whatsappNumber || business.phone
  const waLink = bakeryPhone ? generateWhatsAppLink(bakeryPhone, message) : null

  if (!enquiryNumber) {
    return (
      <section className="page">
        <h1>No enquiry found</h1>
        <p className="lede">Start a cake enquiry from the menu when you are ready.</p>
        <Link className="btn btn-primary" to="/custom-cake">
          Start a Cake Enquiry
        </Link>
      </section>
    )
  }

  return (
    <section className="page success-page">
      <p className="eyebrow">Enquiry submitted</p>
      <h1>Thank you</h1>
      <p className="lede">
        Your enquiry <strong>{enquiryNumber}</strong> is saved. Continue on WhatsApp so the baker can
        review details and share a quote.
      </p>

      <div className="success-card">
        <p>
          <strong>Enquiry ID</strong>
          <br />
          {enquiryNumber}
        </p>
        {enquiry ? (
          <p className="muted">
            {enquiry.productName || enquiry.requestType} · {enquiry.occasion || '—'} ·{' '}
            {enquiry.preferredDateLabel}
          </p>
        ) : null}
      </div>

      <div className="cta-row">
        {waLink && waLink !== '#' ? (
          <a className="btn btn-primary" href={waLink} target="_blank" rel="noreferrer">
            Continue on WhatsApp
          </a>
        ) : (
          <p className="muted">
            Share enquiry {enquiryNumber} with the bakery on WhatsApp to continue.
          </p>
        )}
        <Link className="btn btn-secondary" to="/">
          Back home
        </Link>
      </div>
    </section>
  )
}
