import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { appConfig, isFirebaseConfigured } from '../../config/appConfig'
import { getFirestoreDb } from '../firebase'
import { demoEnquiries } from '../../data/demoEnquiries'

const DEMO_STORE_KEY = 'ck_admin_demo_enquiries_v1'

function cloneDemo() {
  return demoEnquiries.map((e) => ({ ...e, deliveryAddress: e.deliveryAddress ? { ...e.deliveryAddress } : null, customerSnapshot: { ...e.customerSnapshot } }))
}

function readDemoStore() {
  try {
    const raw = localStorage.getItem(DEMO_STORE_KEY)
    if (!raw) {
      const seed = cloneDemo()
      localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw)
  } catch {
    return cloneDemo()
  }
}

function writeDemoStore(items) {
  try {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function normalizeEnquiry(id, data) {
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || null,
  }
}

/**
 * @param {string} [businessId]
 */
export async function listEnquiries(businessId = appConfig.defaultBusinessId) {
  if (!isFirebaseConfigured()) {
    return readDemoStore().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  }

  try {
    const db = getFirestoreDb()
    const ref = collection(db, 'businesses', businessId, 'enquiries')
    const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')))
    const items = snap.docs.map((d) => normalizeEnquiry(d.id, d.data()))
    if (!items.length) return readDemoStore()
    return items
  } catch {
    return readDemoStore()
  }
}

/**
 * @param {string} enquiryId
 * @param {string} [businessId]
 */
export async function getEnquiry(enquiryId, businessId = appConfig.defaultBusinessId) {
  if (!enquiryId) return null

  if (!isFirebaseConfigured()) {
    return readDemoStore().find((e) => e.id === enquiryId || e.enquiryNumber === enquiryId) || null
  }

  try {
    const db = getFirestoreDb()
    const snap = await getDoc(doc(db, 'businesses', businessId, 'enquiries', enquiryId))
    if (snap.exists()) return normalizeEnquiry(snap.id, snap.data())
    return readDemoStore().find((e) => e.id === enquiryId) || null
  } catch {
    return readDemoStore().find((e) => e.id === enquiryId) || null
  }
}

/**
 * @param {string} enquiryId
 * @param {Record<string, unknown>} patch
 * @param {string} [businessId]
 */
export async function updateEnquiry(enquiryId, patch, businessId = appConfig.defaultBusinessId) {
  if (!isFirebaseConfigured()) {
    const items = readDemoStore()
    const idx = items.findIndex((e) => e.id === enquiryId)
    if (idx === -1) throw new Error('Enquiry not found')
    const next = {
      ...items[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    items[idx] = next
    writeDemoStore(items)
    return next
  }

  const db = getFirestoreDb()
  const ref = doc(db, 'businesses', businessId, 'enquiries', enquiryId)
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  })
  return getEnquiry(enquiryId, businessId)
}

export function computeBalance(quotedPrice, advanceRequired) {
  const quote = Number(quotedPrice) || 0
  const advance = Number(advanceRequired) || 0
  return Math.max(quote - advance, 0)
}

/**
 * Dashboard counters from enquiry list.
 */
export function summarizeEnquiries(enquiries = []) {
  const today = new Date().toISOString().slice(0, 10)
  const newCount = enquiries.filter((e) => e.status === 'NEW').length
  const pendingQuotes = enquiries.filter((e) =>
    ['NEW', 'REVIEWING'].includes(e.status),
  ).length
  const pendingConfirmations = enquiries.filter((e) =>
    ['QUOTE_SENT', 'CUSTOMER_CONFIRMED', 'ADVANCE_PENDING'].includes(e.status),
  ).length
  const upcoming = enquiries.filter((e) => {
    if (!e.preferredDate) return false
    if (['CANCELLED', 'REJECTED', 'COMPLETED'].includes(e.status)) return false
    return e.preferredDate >= today
  })
  const todayCount = enquiries.filter((e) => String(e.createdAt || '').startsWith(today)).length

  return {
    todayCount,
    newCount,
    pendingQuotes,
    pendingConfirmations,
    upcomingOrders: upcoming.length,
    upcomingDates: upcoming
      .slice()
      .sort((a, b) => String(a.preferredDate).localeCompare(String(b.preferredDate)))
      .slice(0, 5),
  }
}
