import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authClient, useSession } from '../lib/auth-client'

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const errorClass =
  'rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600 dark:border-red-400/40 dark:bg-red-400/10 dark:text-red-400'

const inputClass =
  'rounded-md border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:outline-purple-400'

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
    return (
      <div className="flex flex-grow items-center justify-center text-neutral-500 dark:text-neutral-400">
        Loading…
      </div>
    )
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
    <div className="flex flex-grow items-center justify-center p-6">
      <form
        className="flex w-full max-w-[360px] flex-col gap-3 text-left"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <h1 className="mb-1 text-3xl font-medium text-neutral-900 dark:text-neutral-100">Tickly</h1>
        <h2 className="mb-3 font-normal text-neutral-500 dark:text-neutral-400">Sign in</h2>
        {error && <p className={errorClass}>{error}</p>}
        <label htmlFor="email" className="text-sm text-neutral-900 dark:text-neutral-100">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          className={inputClass}
          {...register('email')}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        <label htmlFor="password" className="text-sm text-neutral-900 dark:text-neutral-100">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          {...register('password')}
        />
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 cursor-pointer rounded-md border border-purple-600/50 bg-purple-600/10 px-4 py-2.5 text-purple-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-purple-400/50 dark:bg-purple-400/15 dark:text-purple-400"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
