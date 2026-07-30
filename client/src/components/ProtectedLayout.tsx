import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../lib/auth-client'
import NavBar from './NavBar'
import './ProtectedLayout.css'

export default function ProtectedLayout() {
  const { data, isPending } = useSession()

  if (isPending) {
    return <div className="page-loading">Loading…</div>
  }

  if (!data) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <NavBar user={data.user} />
      <main className="page-content">
        <Outlet />
      </main>
    </>
  )
}
