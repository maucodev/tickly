import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/auth-client'

type NavBarProps = {
  user: {
    name: string
    email: string
    image?: string | null
  }
}

export default function NavBar({ user }: NavBarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate('/login', { replace: true }),
      },
    })
  }

  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 px-8 py-4 dark:border-neutral-800">
      <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Tickly</span>
      <div className="flex items-center gap-3">
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{user.name}</span>
        <button
          type="button"
          className="cursor-pointer rounded-md border border-neutral-200 bg-transparent px-3.5 py-1.5 text-neutral-500 transition-colors hover:border-purple-500/50 hover:text-purple-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-purple-400/50 dark:hover:text-purple-400"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </nav>
  )
}
