import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { appConfig, isFirebaseConfigured } from '../config/appConfig'
import { getFirestoreDb } from '../services/firebase'
import { readDemoBusiness, saveBusinessSettings } from '../services/firestore/businessSettings'

const BusinessContext = createContext(null)

const fallbackBusiness = {
  businessId: appConfig.defaultBusinessId,
  businessName: 'Cakes by Kee',
  displayName: 'Cakes by Kee',
  description:
    'Handcrafted cakes, brownies, and custom celebration bakes. Enquiries welcome — WhatsApp continues after you submit.',
  whatsappNumber: '',
  phone: '',
  pickupAvailable: true,
  deliveryAvailable: true,
  minimumPreorderDays: 4,
  currency: 'INR',
  instagramHandle: '_cakes_by_kee_',
  instagramUrl: 'https://www.instagram.com/_cakes_by_kee_/',
  loadedFromFirestore: false,
}

export function BusinessProvider({ children }) {
  const [business, setBusiness] = useState(fallbackBusiness)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isFirebaseConfigured()) {
        const demo = readDemoBusiness()
        if (demo) {
          setBusiness((prev) => ({ ...prev, ...demo }))
        }
        setLoading(false)
        return
      }

      try {
        const db = getFirestoreDb()
        const businessId = appConfig.defaultBusinessId
        const [generalSnap, rulesSnap] = await Promise.all([
          getDoc(doc(db, 'businesses', businessId, 'settings', 'general')),
          getDoc(doc(db, 'businesses', businessId, 'settings', 'orderRules')),
        ])

        if (cancelled) return

        const general = generalSnap.exists() ? generalSnap.data() : {}
        const rules = rulesSnap.exists() ? rulesSnap.data() : {}

        setBusiness({
          ...fallbackBusiness,
          ...general,
          businessId,
          minimumPreorderDays: rules.minimumPreorderDays ?? fallbackBusiness.minimumPreorderDays,
          pickupAvailable: rules.pickupEnabled ?? general.pickupAvailable ?? true,
          deliveryAvailable: rules.deliveryEnabled ?? general.deliveryAvailable ?? true,
          loadedFromFirestore: generalSnap.exists(),
        })
        setError(null)
      } catch (err) {
        if (!cancelled) {
          setError(err)
          setBusiness(fallbackBusiness)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const saveBusiness = useCallback(async (patch) => {
    const saved = await saveBusinessSettings(patch, business.businessId)
    setBusiness((prev) => ({ ...prev, ...saved }))
    return saved
  }, [business.businessId])

  const value = useMemo(
    () => ({ business, loading, error, saveBusiness }),
    [business, loading, error, saveBusiness],
  )

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  )
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}
