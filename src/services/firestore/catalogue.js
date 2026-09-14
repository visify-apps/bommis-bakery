import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { appConfig, isFirebaseConfigured } from '../../config/appConfig'
import { getFirestoreDb } from '../firebase'
import { seedCategories, seedProducts } from '../../data/seedCatalogue'

function businessPath(businessId = appConfig.defaultBusinessId) {
  return ['businesses', businessId]
}

function sortByDisplayOrder(items) {
  return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
}

/**
 * @param {string} [businessId]
 */
export async function listCategories(businessId = appConfig.defaultBusinessId) {
  if (!isFirebaseConfigured()) {
    return sortByDisplayOrder(seedCategories.filter((c) => c.available !== false))
  }

  try {
    const db = getFirestoreDb()
    const ref = collection(db, ...businessPath(businessId), 'categories')
    const snap = await getDocs(query(ref, orderBy('displayOrder', 'asc')))
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return sortByDisplayOrder(items.filter((c) => c.available !== false))
  } catch {
    return []
  }
}

/**
 * @param {string} [businessId]
 * @param {{ categoryId?: string, cakeOnly?: boolean }} [options]
 */
export async function listProducts(businessId = appConfig.defaultBusinessId, options = {}) {
  const { categoryId, cakeOnly = false } = options
  const cakeCategoryIds = new Set([
    'custom-cakes',
    'fresh-cream',
    'wedding-fondant',
    'special-fusion',
    'bento',
    'seasonal',
  ])

  const fromSeed = () => {
    let local = seedProducts
    try {
      const raw = localStorage.getItem('ck_admin_demo_products_v1')
      if (raw) local = JSON.parse(raw)
    } catch {
      // ignore
    }
    let items = local.filter((p) => p.available !== false)
    if (categoryId) items = items.filter((p) => p.categoryId === categoryId)
    if (cakeOnly) items = items.filter((p) => cakeCategoryIds.has(p.categoryId))
    return sortByDisplayOrder(items)
  }

  if (!isFirebaseConfigured()) return fromSeed()

  try {
    const db = getFirestoreDb()
    const ref = collection(db, ...businessPath(businessId), 'products')
    const constraints = [where('available', '==', true)]
    if (categoryId) constraints.unshift(where('categoryId', '==', categoryId))
    const snap = await getDocs(query(ref, ...constraints, orderBy('displayOrder', 'asc')))
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    if (cakeOnly) items = items.filter((p) => cakeCategoryIds.has(p.categoryId))
    return sortByDisplayOrder(items)
  } catch {
    return []
  }
}

/**
 * @param {string} productId
 * @param {string} [businessId]
 */
export async function getProduct(productId, businessId = appConfig.defaultBusinessId) {
  if (!productId) return null

  const fromLocal = () => {
    try {
      const raw = localStorage.getItem('ck_admin_demo_products_v1')
      if (raw) {
        const local = JSON.parse(raw)
        const found = local.find((p) => p.id === productId)
        if (found) return found
      }
    } catch {
      // ignore
    }
    return seedProducts.find((p) => p.id === productId) || null
  }

  if (!isFirebaseConfigured()) {
    return fromLocal()
  }

  try {
    const db = getFirestoreDb()
    const snap = await getDoc(doc(db, ...businessPath(businessId), 'products', productId))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
    return null
  } catch {
    return null
  }
}

export function getCategoryName(categories, categoryId) {
  return categories.find((c) => c.id === categoryId)?.name || categoryId || '—'
}
