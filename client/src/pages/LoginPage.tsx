import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authClient, useSession } from '../lib/auth-client'
import './LoginPage.css'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { data, isPending } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  if (isPending) {
    return <div className="page-loading">Loading…</div>
  }

  if (data) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    setError(null)

    const { error: signInError } = await authClient.signIn.email({ email, password })

    if (signInError) {
      setError(signInError.message ?? 'Invalid email or password')
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Tickly</h1>
        <h2>Sign in</h2>
        {error && <p className="login-error">{error}</p>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          {...register('email')}
        />
        {errors.email && <p className="login-error">{errors.email.message}</p>}
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && <p className="login-error">{errors.password.message}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
