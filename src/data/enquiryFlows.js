import {
  createEmptyEnquiryDraft,
  ENQUIRY_STEPS,
  inferRequestTypeFromProduct,
} from './enquiryOptions'

/**
 * Build step list for general custom enquiry vs product-specific enquiry.
 */
export function getEnquiryFlow(product) {
  if (!product) {
    return {
      mode: 'custom',
      steps: ENQUIRY_STEPS,
      title: 'Cake enquiry',
      subtitle:
        'Tell us what you need. The bakery will review and continue with you on WhatsApp — no account required.',
    }
  }

  const isCustom =
    product.requiresCustomEnquiry ||
    product.priceType === 'enquiry' ||
    product.categoryId === 'custom-cakes'

  if (isCustom) {
    return {
      mode: 'product-custom',
      steps: [
        { id: 'product', title: 'Your cake', short: 'Product' },
        { id: 'occasion', title: 'Occasion', short: 'Occasion' },
        { id: 'requirements', title: 'Details', short: 'Details' },
        { id: 'reference', title: 'Reference', short: 'Reference' },
        { id: 'date', title: 'Date', short: 'Date' },
        { id: 'fulfillment', title: 'Pickup / delivery', short: 'Fulfillment' },
        { id: 'contact', title: 'Your details', short: 'Contact' },
        { id: 'review', title: 'Review', short: 'Review' },
      ],
      title: `Enquire: ${product.name}`,
      subtitle: 'Share your details for this cake. You’ll get a quote on WhatsApp.',
    }
  }

  return {
    mode: 'product-simple',
    steps: [
      { id: 'product', title: 'Your order', short: 'Product' },
      { id: 'quantity', title: 'Quantity & notes', short: 'Quantity' },
      { id: 'date', title: 'Date', short: 'Date' },
      { id: 'fulfillment', title: 'Pickup / delivery', short: 'Fulfillment' },
      { id: 'contact', title: 'Your details', short: 'Contact' },
      { id: 'review', title: 'Review', short: 'Review' },
    ],
    title: `Enquire: ${product.name}`,
    subtitle: 'Quick enquiry for this item. The bakery will confirm on WhatsApp.',
  }
}

export function buildDraftFromProduct(product, existing = createEmptyEnquiryDraft()) {
  if (!product) return existing
  const servings =
    existing.servings ||
    (product.minimumQuantity ? String(product.minimumQuantity) : existing.servings)
  const next = {
    ...existing,
    productId: product.id,
    productName: product.name,
    requestType: inferRequestTypeFromProduct(product),
    flavour: existing.flavour || product.name,
    servings,
  }
  return next
}

export function mapStepIdToLegacyIndex(stepId) {
  switch (stepId) {
    case 'need':
      return 0
    case 'product':
      return -1
    case 'occasion':
      return 1
    case 'requirements':
    case 'quantity':
      return 2
    case 'reference':
      return 3
    case 'date':
      return 4
    case 'fulfillment':
      return 5
    case 'contact':
      return 6
    case 'review':
      return 7
    default:
      return 0
  }
}
