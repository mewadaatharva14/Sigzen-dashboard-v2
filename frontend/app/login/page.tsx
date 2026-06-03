'use client'
import { useState, useEffect } from 'react'
import { signIn, signUp, getSession } from '@/lib/auth'
import { Eye, EyeOff, BarChart3, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
  })

  // If already logged in redirect to dashboard
  useEffect(() => {
    getSession().then(session => {
      if (session) {
        window.location.href = '/'
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isLogin) {
      const { data, error } = await signIn(form.email, form.password)
      if (error) {
        setError(error.message)
      } else {
        // Force hard redirect to dashboard
        window.location.href = '/'
      }
    } else {
        const { error } = await signUp(form.email, form.password, form.fullName)
        if (error) {
            setError(error.message)
        } else {
            // Auto sign in after registration
            const { error: signInError } = await signIn(form.email, form.password)
            if (signInError) {
            setSuccess('Account created! Please sign in.')
            setIsLogin(true)
            } else {
            window.location.href = '/'
            }
        }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md">

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/30">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Sigzen BI</h1>
          <p className="text-slate-400 mt-1">CEO Command Center</p>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name — only for register */}
            {!isLogin && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? 'Please wait...'
                : isLogin ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <span className="text-slate-400 text-sm">
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '
              }
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
              }}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Sigzen Technologies BI Platform v1.0
        </p>
      </div>
    </div>
  )
}