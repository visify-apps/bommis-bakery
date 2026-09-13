/**
 * WhatsApp click-to-chat helpers (MVP — no Business API).
 */

/**
 * @param {string} phone - Digits with country code preferred (e.g. 9198xxxxxxxx)
 * @param {string} [message]
 * @returns {string}
 */
export function generateWhatsAppLink(phone, message = '') {
  const digits = String(phone || '').replace(/\D/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  if (!digits) return message ? `https://wa.me/${text}` : '#'
  return `https://wa.me/${digits}${text}`
}

function eggLabel(value) {
  if (value === 'eggless') return 'Eggless'
  if (value === 'egg') return 'With egg'
  return value || ''
}

function handoffLabel(enquiry) {
  if (enquiry.fulfillmentType === 'delivery') {
    const place = [enquiry.deliveryAddress?.area, enquiry.deliveryAddress?.pincode]
      .filter(Boolean)
      .join(' ')
    return place ? `Delivery · ${place}` : 'Delivery'
  }
  if (enquiry.fulfillmentType === 'pickup') return 'Pickup'
  return ''
}

function qtyLabel(enquiry) {
  const raw = String(enquiry.servings || '').trim()
  if (!raw) return ''
  if (/kg|pcs|piece|bento/i.test(raw)) return raw
  if (enquiry.cakeSize) return raw
  return `${raw} pcs`
}

/**
 * One summary for every enquiry type: custom, menu cake, or priced pieces.
 */
export function buildEnquiryContinuationMessage(enquiry, business = {}) {
  const name = business.whatsappGreetingName || business.displayName || 'there'
  const cake = enquiry.productName || enquiry.requestType || 'Cake enquiry'
  const spec = [enquiry.flavour, enquiry.cakeSize, qtyLabel(enquiry), eggLabel(enquiry.eggPreference)]
    .filter(Boolean)
    .join(' · ')
  const extras = [enquiry.theme, enquiry.colourPreference, enquiry.shape].filter(Boolean).join(' · ')
  const money =
    enquiry.quotedPrice != null && enquiry.autoPriced ? `Total ₹${enquiry.quotedPrice}` : ''
  const who = enquiry.customerSnapshot?.name
  const lines = [
    `Hi ${name},`,
    `Enquiry ${enquiry.enquiryNumber || ''}`.trim(),
    who ? `I'm ${who}.` : '',
    cake,
    enquiry.occasion,
    spec,
    extras,
    enquiry.messageOnCake ? `On cake: ${enquiry.messageOnCake}` : '',
    [enquiry.preferredDateLabel, handoffLabel(enquiry)].filter(Boolean).join(' · '),
    enquiry.deliveryAddress?.address,
    money,
    enquiry.otherRequirements || enquiry.referenceNotes,
  ].filter(Boolean)

  if (enquiry.referenceDeferredToWhatsApp || enquiry.referenceFileName) {
    lines.push('I have a reference photo to send.')
  }
  return lines.join('\n')
}

export function enquiryWhatsAppUrl(enquiry, business = {}) {
  const phone = business.whatsappNumber || business.phone
  return generateWhatsAppLink(phone, buildEnquiryContinuationMessage(enquiry, business))
}

export const AFTER_ENQUIRY_HOME_KEY = 'ck_after_enquiry'

function publicHomeHref() {
  const { pathname, search } = window.location
  return `${pathname}${search}#/`
}

/** Drop the enquiry page from history so Back from WhatsApp lands on Home. */
export function replaceEnquiryWithHome() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(AFTER_ENQUIRY_HOME_KEY, 'home')
  } catch {
    // ignore
  }
  window.history.replaceState(window.history.state, '', publicHomeHref())
}

export function openEnquiryOnWhatsApp(enquiry, business = {}) {
  const url = enquiryWhatsAppUrl(enquiry, business)
  if (!url || url === '#') return null
  if (typeof window !== 'undefined') {
    replaceEnquiryWithHome()
    window.location.assign(url)
  }
  return url
}

/**
 * @param {{ enquiryNumber?: string, productName?: string, quotedPrice?: number|string, advanceRequired?: number|string, balanceAmount?: number|string }} enquiry
 * @param {{ customerFirstName?: string }} [opts]
 */
export function buildQuotationMessage(enquiry, opts = {}) {
  const name = opts.customerFirstName || 'there'
  const item = enquiry.productName || enquiry.requestType || 'your order'
  const lines = [
    `Hi ${name}, regarding enquiry ${enquiry.enquiryNumber || ''}:`,
    '',
    `${item} — ₹${enquiry.quotedPrice}.`,
    `Advance required: ₹${enquiry.advanceRequired}.`,
    `Balance: ₹${enquiry.balanceAmount}.`,
    '',
    'Please confirm.',
  ]
  return lines.join('\n')
}
