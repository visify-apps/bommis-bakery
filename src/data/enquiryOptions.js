/**
 * Enquiry form options and defaults.
 */

export const REQUEST_TYPES = [
  'Custom Cake',
  'Regular Cake',
  'Bento Cake',
  'Brownies',
  'Bulk Order',
  'Other',
]

export const OCCASIONS = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Engagement',
  'Baby / Child',
  'Corporate',
  'Festival',
  'Other',
]

export const EGG_OPTIONS = [
  { value: 'eggless', label: 'Eggless' },
  { value: 'egg', label: 'With egg' },
  { value: '', label: 'No preference' },
]

export const FULFILLMENT_TYPES = [
  { value: 'pickup', label: 'Pickup' },
  { value: 'delivery', label: 'Delivery' },
]

export const ENQUIRY_STEPS = [
  { id: 'need', title: 'Need', short: 'Need' },
  { id: 'occasion', title: 'Occasion', short: 'Occasion' },
  { id: 'requirements', title: 'Details', short: 'Details' },
  { id: 'reference', title: 'Photo', short: 'Photo' },
  { id: 'date', title: 'Date', short: 'Date' },
  { id: 'fulfillment', title: 'Pickup', short: 'Pickup' },
  { id: 'contact', title: 'You', short: 'You' },
  { id: 'review', title: 'Check', short: 'Check' },
]

export const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_REFERENCE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function createEmptyEnquiryDraft() {
  return {
    requestType: '',
    requestTypeOther: '',
    occasion: '',
    occasionOther: '',
    cakeSize: '',
    servings: '',
    flavour: '',
    eggPreference: '',
    shape: '',
    theme: '',
    colourPreference: '',
    messageOnCake: '',
    age: '',
    otherRequirements: '',
    referenceNotes: '',
    preferredDate: '',
    fulfillmentType: 'pickup',
    deliveryAddress: {
      address: '',
      area: '',
      pincode: '',
      notes: '',
    },
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    productId: null,
    productName: null,
    quotedPrice: null,
    advanceRequired: null,
    balanceAmount: null,
    autoPriced: false,
    priceLocked: false,
  }
}

/** Map product category / name hints into requestType */
export function inferRequestTypeFromProduct(product) {
  if (!product) return 'Custom Cake'
  const cat = String(product.categoryId || '').toLowerCase()
  const name = String(product.name || '').toLowerCase()
  if (cat.includes('bento') || name.includes('bento')) return 'Bento Cake'
  if (cat.includes('brownie') || name.includes('brownie')) return 'Brownies'
  if (cat.includes('bulk') || name.includes('bulk')) return 'Bulk Order'
  if (product.requiresCustomEnquiry || product.priceType === 'enquiry') return 'Custom Cake'
  if (cat.includes('fresh') || cat.includes('special') || cat.includes('wedding')) return 'Regular Cake'
  return 'Custom Cake'
}
