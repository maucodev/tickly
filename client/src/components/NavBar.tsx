import { LogOutIcon } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

type NavBarProps = {
  user: {
    name: string
    email: string
    image?: string | null
    role: string
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
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
    <nav className="flex items-center justify-between border-b px-8 py-4">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-semibold">
          Tickly
        </Link>
        {user.role === 'admin' && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              cn(
                'text-sm font-medium text-neutral-500 hover:text-foreground dark:text-neutral-400',
                isActive && 'text-foreground',
              )
            }
          >
            Users
          </NavLink>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Avatar>
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{user.name}</span>
        <Button type="button" variant="outline" onClick={handleLogout}>
          <LogOutIcon />
          Log out
        </Button>
      </div>
    </nav>
  )
}
