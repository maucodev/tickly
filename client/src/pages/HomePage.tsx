import { useSession } from '../lib/auth-client'
import './HomePage.css'

export default function HomePage() {
  const { data } = useSession()

  return (
    <section className="home-page">
      <h1>Welcome{data?.user?.name ? `, ${data.user.name}` : ''}</h1>
      <p>This is your Tickly dashboard.</p>
    </section>
  )
}
