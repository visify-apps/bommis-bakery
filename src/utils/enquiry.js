import { normalizePhoneDigits, isLikelyIndianMobile } from './validation'
import {
  ALLOWED_REFERENCE_TYPES,
  MAX_REFERENCE_IMAGE_BYTES,
} from '../data/enquiryOptions'

/**
 * @param {string} preferredDate - YYYY-MM-DD
 * @param {number} minimumPreorderDays
 */
export function getMinPreferredDateISO(minimumPreorderDays = 4) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + Number(minimumPreorderDays || 4))
  return toISODate(d)
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * @param {string} isoDate
 * @param {number} minimumPreorderDays
 */
export function isPreferredDateTooSoon(isoDate, minimumPreorderDays = 4) {
  if (!isoDate) return true
  const min = getMinPreferredDateISO(minimumPreorderDays)
  return isoDate < min
}

/**
 * Validate a single step. Returns error message or empty string.
 */
export function validateEnquiryStep(stepIndex, draft, options = {}) {
  const { minimumPreorderDays = 4, referenceFile = null, mode = 'custom' } = options

  switch (stepIndex) {
    case 0: {
      if (mode !== 'custom') return ''
      if (!draft.requestType) return 'Please choose what you need.'
      if (draft.requestType === 'Other' && !draft.requestTypeOther?.trim()) {
        return 'Please describe what you need.'
      }
      return ''
    }
    case 1: {
      if (mode === 'product-simple') return ''
      if (!draft.occasion) return 'Please select an occasion.'
      if (draft.occasion === 'Other' && !draft.occasionOther?.trim()) {
        return 'Please describe the occasion.'
      }
      return ''
    }
    case 2: {
      if (mode === 'product-simple') {
        const qty = Number(draft.servings)
        if (!draft.servings?.trim()) return 'Please enter quantity.'
        if (Number.isNaN(qty) || qty < 1) return 'Enter a valid quantity.'
      }
      return ''
    }
    case 3: {
      if (referenceFile) {
        if (!ALLOWED_REFERENCE_TYPES.includes(referenceFile.type)) {
          return 'Reference image must be JPG, PNG, or WebP.'
        }
        if (referenceFile.size > MAX_REFERENCE_IMAGE_BYTES) {
          return 'Reference image must be 5 MB or smaller.'
        }
      }
      return ''
    }
    case 4: {
      if (!draft.preferredDate) return 'Please select a preferred date.'
      if (isPreferredDateTooSoon(draft.preferredDate, minimumPreorderDays)) {
        return `Please choose a date at least ${minimumPreorderDays} days from today.`
      }
      return ''
    }
    case 5: {
      if (!draft.fulfillmentType) return 'Please choose pickup or delivery.'
      if (draft.fulfillmentType === 'delivery') {
        if (!draft.deliveryAddress?.address?.trim()) return 'Please enter a delivery address.'
        if (!draft.deliveryAddress?.area?.trim()) return 'Please enter an area.'
        if (!draft.deliveryAddress?.pincode?.trim()) return 'Please enter a pincode.'
        if (!/^\d{6}$/.test(draft.deliveryAddress.pincode.trim())) {
          return 'Pincode should be 6 digits.'
        }
      }
      return ''
    }
    case 6: {
      if (!draft.customerName?.trim()) return 'Please enter your name.'
      if (!draft.customerPhone?.trim()) return 'WhatsApp phone number is required.'
      if (!isLikelyIndianMobile(draft.customerPhone)) {
        return 'Enter a valid 10-digit Indian mobile number.'
      }
      if (draft.customerEmail?.trim()) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.customerEmail.trim())
        if (!ok) return 'Email looks invalid.'
      }
      return ''
    }
    case 7: {
      if (mode === 'product-simple') {
        return (
          validateEnquiryStep(2, draft, options) ||
          validateEnquiryStep(4, draft, options) ||
          validateEnquiryStep(5, draft, options) ||
          validateEnquiryStep(6, draft, options)
        )
      }
      if (mode === 'product-custom') {
        return (
          validateEnquiryStep(1, draft, options) ||
          validateEnquiryStep(4, draft, options) ||
          validateEnquiryStep(5, draft, options) ||
          validateEnquiryStep(6, draft, options) ||
          validateEnquiryStep(3, draft, options)
        )
      }
      return (
        validateEnquiryStep(0, draft, options) ||
        validateEnquiryStep(1, draft, options) ||
        validateEnquiryStep(4, draft, options) ||
        validateEnquiryStep(5, draft, options) ||
        validateEnquiryStep(6, draft, options) ||
        validateEnquiryStep(3, draft, options)
      )
    }
    default:
      return ''
  }
}

export function validateByStepId(stepId, draft, options = {}) {
  if (stepId === 'product') {
    if (!draft.productId) return 'Product is missing. Go back to the menu.'
    return ''
  }
  if (stepId === 'quantity') return validateEnquiryStep(2, draft, { ...options, mode: 'product-simple' })
  if (stepId === 'need') return validateEnquiryStep(0, draft, options)
  if (stepId === 'occasion') return validateEnquiryStep(1, draft, options)
  if (stepId === 'requirements') return validateEnquiryStep(2, draft, options)
  if (stepId === 'reference') return validateEnquiryStep(3, draft, options)
  if (stepId === 'date') return validateEnquiryStep(4, draft, options)
  if (stepId === 'fulfillment') return validateEnquiryStep(5, draft, options)
  if (stepId === 'contact') return validateEnquiryStep(6, draft, options)
  if (stepId === 'review') return validateEnquiryStep(7, draft, options)
  return ''
}

export function resolveRequestTypeLabel(draft) {
  if (draft.requestType === 'Other') return draft.requestTypeOther?.trim() || 'Other'
  return draft.requestType
}

export function resolveOccasionLabel(draft) {
  if (draft.occasion === 'Other') return draft.occasionOther?.trim() || 'Other'
  return draft.occasion
}

export function toWhatsAppPhone(phone) {
  const digits = normalizePhoneDigits(phone)
  if (digits.length === 10) return `91${digits}`
  return digits
}

export function createSubmissionToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
