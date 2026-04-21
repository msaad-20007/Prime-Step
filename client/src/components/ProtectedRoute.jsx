import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.auth.user)

  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />

  return children
}
