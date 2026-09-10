/**
 * Auto-pricing for catalogue items with a known unit price.
 */

export function canAutoPrice(product) {
  if (!product) return false
  if (product.priceType === 'enquiry' || product.requiresCustomEnquiry) return false
  const price = Number(product.basePrice)
  return (product.priceType === 'fixed' || product.priceType === 'starting_from') && price > 0
}

export function lineTotal(unitPrice, quantity) {
  const unit = Number(unitPrice) || 0
  const qty = Number(quantity) || 0
  if (unit <= 0 || qty <= 0) return null
  return Math.round(unit * qty)
}

export function suggestedAdvance(total) {
  if (!total || total <= 0) return 0
  return Math.round(total / 2)
}
