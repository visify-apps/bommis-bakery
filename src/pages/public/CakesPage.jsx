import { Navigate } from 'react-router-dom'

/** Cakes listing folds into Menu for a simpler site. */
export function CakesPage() {
  return <Navigate to="/menu" replace />
}
