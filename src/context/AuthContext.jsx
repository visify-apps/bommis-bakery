import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { appConfig, isFirebaseConfigured } from '../config/appConfig'
import {
  getFirebaseAuth,
  getFirestoreDb,
} from '../services/firebase'

const AuthContext = createContext(null)
const DEMO_ADMIN_KEY = 'ck_demo_admin_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [adminProfile, setAdminProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configReady] = useState(() => isFirebaseConfigured())

  useEffect(() => {
    if (!configReady) {
      try {
        if (sessionStorage.getItem(DEMO_ADMIN_KEY) === '1') {
          setUser({ email: 'demo-admin@local.dev', uid: 'demo-admin' })
          setAdminProfile({
            id: 'demo-admin',
            businessId: appConfig.defaultBusinessId,
            role: 'owner',
            email: 'demo-admin@local.dev',
            demo: true,
          })
        }
      } catch {
        // ignore
      }
      setLoading(false)
      return undefined
    }

    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      if (!nextUser) {
        setAdminProfile(null)
        setLoading(false)
        return
      }

      try {
        const businessId = appConfig.defaultBusinessId
        const snap = await getDoc(
          doc(getFirestoreDb(), 'businesses', businessId, 'adminUsers', nextUser.uid),
        )
        setAdminProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      } catch {
        setAdminProfile(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [configReady])

  const value = useMemo(
    () => ({
      user,
      adminProfile,
      loading,
      isAdmin: Boolean(user && adminProfile),
      firebaseReady: configReady,
      demoMode: !configReady,
      async login(email, password) {
        if (!configReady) {
          if (email.trim() && password.length >= 4) {
            const demoUser = { email: email.trim(), uid: 'demo-admin' }
            const profile = {
              id: 'demo-admin',
              businessId: appConfig.defaultBusinessId,
              role: 'owner',
              email: email.trim(),
              demo: true,
            }
            try {
              sessionStorage.setItem(DEMO_ADMIN_KEY, '1')
            } catch {
              // ignore
            }
            setUser(demoUser)
            setAdminProfile(profile)
            return demoUser
          }
          throw new Error('Demo login: enter any email and a password (4+ characters).')
        }
        const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
        return credential.user
      },
      async logout() {
        if (!configReady) {
          try {
            sessionStorage.removeItem(DEMO_ADMIN_KEY)
          } catch {
            // ignore
          }
          setUser(null)
          setAdminProfile(null)
          return
        }
        await signOut(getFirebaseAuth())
      },
    }),
    [user, adminProfile, loading, configReady],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
