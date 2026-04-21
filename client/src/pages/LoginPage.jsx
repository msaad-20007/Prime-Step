import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '../store/authApi'
import { setCredentials } from '../store/authSlice'
import Logo from '../components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useLoginMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await login({ email, password }).unwrap()
      dispatch(setCredentials({ user: data.user, token: data.token }))
      navigate(data.user?.role === 'admin' ? '/admin' : '/')
    } catch { /* handled by RTK error state */ }
  }

  return (
    <div className="bg-background min-h-screen text-text-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <p className="text-gray-500 text-sm mt-3">Sign in to your account</p>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-6">Welcome back</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error.data?.message ?? 'Invalid email or password'}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity tracking-wide"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-accent hover:underline font-medium">Create one</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
