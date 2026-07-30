import { useNavigate } from 'react-router-dom'
import { authClient } from '../lib/auth-client'
import './NavBar.css'

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
    <nav className="navbar">
      <span className="navbar-brand">Tickly</span>
      <div className="navbar-user">
        <span className="navbar-user-name">{user.name}</span>
        <button type="button" className="navbar-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  )
}
