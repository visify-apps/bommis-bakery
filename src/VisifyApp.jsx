import { useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { VisifyRoute } from './routes/VisifyRoute'
import { VisifyDeskPage } from './pages/visify/VisifyDeskPage'

function VisifyLoginPage() {
  const { login, isVisify, loading, demoMode, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(demoMode ? 'visifyapps@gmail.com' : '')
  const [password, setPassword] = useState(demoMode ? 'demo1234' : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isVisify) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(email.trim(), password)
      if (!result.isVisify) {
        await logout()
        setError('This login is for Visify only. Shop bakers use their own bakery site.')
        return
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-login page">
      <h1>Visify</h1>
      <p className="lede">Operator desk for every shop. Not a bakery admin page.</p>
      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </section>
  )
}

export function VisifyApp() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="login" element={<VisifyLoginPage />} />
          <Route
            path="/"
            element={
              <VisifyRoute>
                <VisifyDeskPage />
              </VisifyRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
