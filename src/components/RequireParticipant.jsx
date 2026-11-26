import { Navigate, useLocation } from 'react-router-dom'

/**
 * Participant-only routes. Session managers are redirected to their
 * workspace instead of seeing participant session pages.
 */
export default function RequireParticipant({
  isAuthenticated,
  currentUser,
  children,
}) {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (currentUser?.role === 'SESSION_MANAGER') {
    return <Navigate to="/manager" replace />
  }

  return children
}
