import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient, useSession } from '@/lib/auth-client'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const SERVER_UNREACHABLE_MESSAGE = 'Unable to reach the server. Please try again later.'

export default function LoginPage() {
  const { data, isPending } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isPending) {
    return <div className="flex flex-grow items-center justify-center text-muted-foreground">Loading…</div>
  }

  if (data) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    setError(null)

    try {
      const { error: signInError } = await authClient.signIn.email({ email, password })

      if (signInError) {
        const isServerError = !signInError.status || signInError.status >= 500
        setError(isServerError ? SERVER_UNREACHABLE_MESSAGE : (signInError.message ?? 'Invalid email or password'))
        return
      }

      navigate('/', { replace: true })
    } catch {
      setError(SERVER_UNREACHABLE_MESSAGE)
    }
  }

  return (
    <div className="flex flex-grow items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Tickly</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="username"
                      autoFocus
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
