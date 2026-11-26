import { Navigate, useLocation } from 'react-router-dom'

/**
 * Redirects unauthenticated visitors to the login screen while preserving
 * the destination so they come back after signing in.
 */
export default function RequireAuth({ isAuthenticated, children }) {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
