import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../lib/auth-client'
import NavBar from './NavBar'

export default function ProtectedLayout() {
  const { data, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex flex-grow items-center justify-center text-neutral-500 dark:text-neutral-400">
        Loading…
      </div>
    )
  }

  if (!data) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <NavBar user={data.user} />
      <main className="flex flex-grow flex-col">
        <Outlet />
      </main>
    </>
  )
}
