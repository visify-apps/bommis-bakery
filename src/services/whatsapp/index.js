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
  if (!digits) return '#'
  const base = `https://wa.me/${digits}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/**
 * @param {{ enquiryNumber?: string, requestType?: string, occasion?: string, preferredDateLabel?: string, flavour?: string, cakeSize?: string, eggPreference?: string }} enquiry
 * @param {{ displayName?: string, whatsappGreetingName?: string }} [business]
 */
export function buildEnquiryContinuationMessage(enquiry, business = {}) {
  const name = business.whatsappGreetingName || business.displayName || 'there'
  const lines = [
    `Hi ${name},`,
    '',
    `I submitted enquiry ${enquiry.enquiryNumber || '(pending)'} on the website.`,
    '',
    `Cake type: ${enquiry.requestType || '—'}`,
    `Occasion: ${enquiry.occasion || '—'}`,
    `Date: ${enquiry.preferredDateLabel || '—'}`,
    `Flavour: ${enquiry.flavour || '—'}`,
    `Size: ${enquiry.cakeSize || '—'}`,
    `Egg/Eggless: ${enquiry.eggPreference || '—'}`,
  ]
  if (enquiry.referenceDeferredToWhatsApp || enquiry.referenceFileName) {
    lines.push('')
    lines.push(
      enquiry.referenceFileName
        ? `I have a reference image ready to send (${enquiry.referenceFileName}).`
        : 'I have a reference image ready to send.',
    )
  }
  lines.push('', 'Please review my enquiry.')
  return lines.join('\n')
}

/**
 * @param {{ enquiryNumber?: string, quotedPrice?: number|string, advanceRequired?: number|string, balanceAmount?: number|string }} enquiry
 * @param {{ customerFirstName?: string }} [opts]
 */
export function buildQuotationMessage(enquiry, opts = {}) {
  const name = opts.customerFirstName || 'there'
  const lines = [
    `Hi ${name}, regarding enquiry ${enquiry.enquiryNumber || ''}:`,
    '',
    `Your custom cake quotation is ₹${enquiry.quotedPrice}.`,
    `Advance required: ₹${enquiry.advanceRequired}.`,
    `Balance: ₹${enquiry.balanceAmount}.`,
    '',
    'Please confirm.',
  ]
  return lines.join('\n')
}
