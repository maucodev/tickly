import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/lib/auth-client'

export default function HomePage() {
  const { data } = useSession()

  return (
    <section className="flex flex-grow flex-col p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome{data?.user?.name ? `, ${data.user.name}` : ''}</CardTitle>
          <CardDescription>This is your Tickly dashboard.</CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
