import { createEmptyEnquiryDraft, inferRequestTypeFromProduct } from './enquiryOptions'
import { getFlowMode } from '../utils/enquiryRules'

const CAKE_STEPS = [
  { id: 'occasion', title: 'What’s the occasion?', short: 'Occasion' },
  { id: 'requirements', title: 'Tell us the cake', short: 'Cake' },
  { id: 'reference', title: 'A photo helps', short: 'Photo' },
  { id: 'date', title: 'When do you need it?', short: 'Date' },
  { id: 'fulfillment', title: 'Pickup or delivery?', short: 'Handover' },
  { id: 'contact', title: 'How can we reach you?', short: 'You' },
  { id: 'review', title: 'Looks right?', short: 'Check' },
]

const PIECE_STEPS = [
  { id: 'quantity', title: 'How many?', short: 'Qty' },
  { id: 'date', title: 'When do you need it?', short: 'Date' },
  { id: 'fulfillment', title: 'Pickup or delivery?', short: 'Handover' },
  { id: 'contact', title: 'How can we reach you?', short: 'You' },
  { id: 'review', title: 'Looks right?', short: 'Check' },
]

const CUSTOM_STEPS = [
  { id: 'need', title: 'What would you like?', short: 'Need' },
  ...CAKE_STEPS,
]

export function getEnquiryFlow(product) {
  const mode = getFlowMode(product)
  if (mode === 'unavailable') {
    return { mode, steps: [], title: 'Unavailable' }
  }
  if (mode === 'piece') {
    return { mode, steps: PIECE_STEPS, title: product.name }
  }
  if (mode === 'cake') {
    return { mode, steps: CAKE_STEPS, title: product.name }
  }
  return { mode: 'custom', steps: CUSTOM_STEPS, title: 'Your cake' }
}

export function buildDraftFromProduct(product, existing = createEmptyEnquiryDraft()) {
  if (!product) return existing
  const servings =
    existing.servings ||
    (product.minimumQuantity ? String(product.minimumQuantity) : existing.servings)
  return {
    ...existing,
    productId: product.id,
    productName: product.name,
    requestType: inferRequestTypeFromProduct(product),
    flavour: existing.flavour || product.name,
    servings,
  }
}
