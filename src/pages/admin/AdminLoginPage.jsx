import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminLoginPage() {
  const { login, isAdmin, isVisify, loading, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromVisify = location.state?.from?.pathname === '/visify'
  const [email, setEmail] = useState(demoMode ? (fromVisify ? 'visifyapps@gmail.com' : 'baker@demo.local') : '')
  const [password, setPassword] = useState(demoMode ? 'demo1234' : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isVisify) {
    return <Navigate to="/visify" replace />
  }

  if (!loading && isAdmin && !fromVisify) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await login(email.trim(), password)
      if (result.isVisify) {
        navigate('/visify', { replace: true })
        return
      }
      const from = location.state?.from?.pathname
      navigate(from && from !== '/visify' ? from : '/admin', { replace: true })
    } catch (err) {
      setError(err?.message || 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-login page">
      <h1>{fromVisify ? 'Visify login' : 'Baker login'}</h1>
      <p className="lede">
        {fromVisify
          ? 'Sign in with visifyapps@gmail.com to open the desk.'
          : 'Sign in to manage enquiries and your menu.'}
      </p>
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
