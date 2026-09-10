/**
 * Baker-facing simple statuses (maps to internal Firestore values).
 *
 * New → just arrived
 * Quoted → price shared, waiting on customer
 * Confirmed → accepted, will bake
 * Done → finished
 * Cancelled → not going ahead
 */

export const SIMPLE_STATUSES = [
  {
    id: 'NEW',
    label: 'New',
    hint: 'Just arrived — reply or quote',
    storeAs: 'NEW',
  },
  {
    id: 'QUOTED',
    label: 'Quoted',
    hint: 'Waiting for customer to confirm',
    storeAs: 'QUOTE_SENT',
  },
  {
    id: 'CONFIRMED',
    label: 'Confirmed',
    hint: 'Accepted — bake this order',
    storeAs: 'CONFIRMED',
  },
  {
    id: 'DONE',
    label: 'Done',
    hint: 'Picked up / delivered',
    storeAs: 'COMPLETED',
  },
  {
    id: 'CANCELLED',
    label: 'Cancelled',
    hint: 'Not going ahead',
    storeAs: 'CANCELLED',
  },
]

const TO_SIMPLE = {
  NEW: 'NEW',
  REVIEWING: 'NEW',
  QUOTE_SENT: 'QUOTED',
  CUSTOMER_CONFIRMED: 'QUOTED',
  ADVANCE_PENDING: 'QUOTED',
  CONFIRMED: 'CONFIRMED',
  IN_PREPARATION: 'CONFIRMED',
  READY: 'CONFIRMED',
  COMPLETED: 'DONE',
  CANCELLED: 'CANCELLED',
  REJECTED: 'CANCELLED',
}

export function toSimpleStatus(raw) {
  return TO_SIMPLE[raw] || 'NEW'
}

export function simpleStatusMeta(rawOrSimple) {
  const id = SIMPLE_STATUSES.some((s) => s.id === rawOrSimple)
    ? rawOrSimple
    : toSimpleStatus(rawOrSimple)
  return SIMPLE_STATUSES.find((s) => s.id === id) || SIMPLE_STATUSES[0]
}

export function storeStatusFromSimple(simpleId) {
  return SIMPLE_STATUSES.find((s) => s.id === simpleId)?.storeAs || 'NEW'
}

export const SIMPLE_PAYMENT = [
  { id: 'UNPAID', label: 'Unpaid' },
  { id: 'PARTIALLY_PAID', label: 'Advance paid' },
  { id: 'PAID', label: 'Fully paid' },
]
