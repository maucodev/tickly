import { useSession } from '../lib/auth-client'

export default function HomePage() {
  const { data } = useSession()

  return (
    <section className="p-8 text-left">
      <h1 className="my-8 text-4xl font-medium tracking-tight text-neutral-900 md:text-6xl dark:text-neutral-100">
        Welcome{data?.user?.name ? `, ${data.user.name}` : ''}
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400">This is your Tickly dashboard.</p>
    </section>
  )
}
