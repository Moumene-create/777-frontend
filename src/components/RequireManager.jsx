import { Navigate } from 'react-router-dom'

export default function RequireManager({
  isAuthenticated,
  currentUser,
  children,
}) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const isManager =
    currentUser?.role?.includes('SESSION_MANAGER') === true

  if (!isManager) {
    return <Navigate to="/sessions" replace />
  }

  return children
}