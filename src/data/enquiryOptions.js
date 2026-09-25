/**
 * Enquiry form options tuned for Bommi's Bakery Instagram order intake.
 */

export const REQUEST_TYPES = [
  'Custom Cake',
  'Theme Cake',
  'Wedding Cake',
  'Fondant Cake',
  'Fresh Cream Cake',
  'Baking Class',
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
  'Class / Workshop',
  'Other',
]

export const EGG_OPTIONS = [
  { value: 'eggless', label: 'Eggless' },
  { value: 'egg', label: 'With egg' },
]

export const FULFILLMENT_TYPES = [
  { value: 'pickup', label: 'Pickup' },
  { value: 'delivery', label: 'Delivery' },
]

export const DELIVERY_TIME_SLOTS = [
  'Morning (9–12)',
  'Afternoon (12–4)',
  'Evening (4–8)',
  'Exact time on WhatsApp',
]

export const ENQUIRY_STEPS = [
  { id: 'need', title: 'Need', short: 'Need' },
  { id: 'occasion', title: 'Occasion', short: 'Occasion' },
  { id: 'requirements', title: 'Details', short: 'Details' },
  { id: 'reference', title: 'Photo', short: 'Photo' },
  { id: 'date', title: 'When', short: 'When' },
  { id: 'fulfillment', title: 'Handover', short: 'Handover' },
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
    preferredTime: '',
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
  if (cat.includes('class') || name.includes('class') || name.includes('workshop')) {
    return 'Baking Class'
  }
  if (cat.includes('wedding') || name.includes('wedding')) return 'Wedding Cake'
  if (cat.includes('fondant') || name.includes('fondant')) return 'Fondant Cake'
  if (cat.includes('fresh') || name.includes('cream')) return 'Fresh Cream Cake'
  if (product.requiresCustomEnquiry || product.priceType === 'enquiry') return 'Custom Cake'
  if (cat.includes('theme') || name.includes('theme')) return 'Theme Cake'
  return 'Custom Cake'
}
