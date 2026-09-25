import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Gate for the standalone Visify desk app (not hosted on shop Pages). */
export function VisifyRoute({ children }) {
  const { user, isVisify, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="page-state">
        <p>Checking session…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isVisify) {
    return (
      <section className="page admin-login">
        <h1>Visify desk</h1>
        <p className="lede">
          You’re signed in as {user.email}. That’s a baker login. Sign out, then use
          visifyapps@gmail.com.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await logout()
            navigate('/login', { replace: true })
          }}
        >
          Sign out
        </button>
      </section>
    )
  }

  return children
}
