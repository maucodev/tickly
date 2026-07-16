import { useEffect, useState } from 'react'
import './App.css'

type Health = { status: string }

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError('Could not connect to the server'))
  }, [])

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Helpdesk</h1>
      <p>Express + React + TypeScript + Bun</p>
      <p>
        Server status:{' '}
        {error ? error : health ? health.status : 'loading...'}
      </p>
    </main>
  )
}

export default App
