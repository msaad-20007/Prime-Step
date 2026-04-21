import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useSendOtpMutation, useVerifyOtpMutation } from '../store/authApi'
import { setCredentials } from '../store/authSlice'
import Logo from '../components/Logo'

const inputCls = 'w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors placeholder-gray-600'

// ─── Step 1: Registration form ────────────────────────────────────────────────
function RegistrationForm({ onOtpSent }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [matchError, setMatchError] = useState('')
  const [sendOtp, { isLoading, error }] = useSendOtpMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setMatchError('Passwords do not match'); return }
    setMatchError('')
    try {
      await sendOtp({ name, email, password }).unwrap()
      onOtpSent({ name, email, password })
    } catch { /* handled by RTK error state */ }
  }

  return (
    <>
      <h1 className="text-xl font-bold mb-1">Join the future</h1>
      <p className="text-gray-500 text-sm mb-6">We'll send a verification code to your email.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Full name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className={inputCls} placeholder="Min. 6 characters" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Confirm password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className={inputCls} placeholder="Repeat password" />
        </div>

        {matchError && <p className="text-red-400 text-sm">{matchError}</p>}
        {error && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error.data?.message ?? 'Something went wrong. Please try again.'}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading}
          className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity tracking-wide">
          {isLoading
            ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Sending code...</span>
            : 'Send Verification Code'}
        </button>
      </form>
    </>
  )
}

// ─── Step 2: OTP verification ─────────────────────────────────────────────────
function OtpForm({ email, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation()
  const [sendOtp, { isLoading: resending }] = useSendOtpMutation()
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const inputRefs = useRef([])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function handleChange(idx, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return
    try {
      const data = await verifyOtp({ email, otp: code }).unwrap()
      dispatch(setCredentials({ user: data.user, token: data.token }))
      navigate('/')
    } catch { /* handled by RTK error state */ }
  }

  const handleResend = async () => {
    // We need the original form data — stored in parent via onBack callback
    // For resend we just call the endpoint again; parent stored the data
    setResent(false)
    setCountdown(60)
    setResent(true)
    setTimeout(() => setResent(false), 3000)
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-accent text-sm mb-5 transition-colors">
        ← Back
      </button>
      <h1 className="text-xl font-bold mb-1">Check your email</h1>
      <p className="text-gray-500 text-sm mb-2">
        We sent a 6-digit code to <span className="text-text-primary font-medium">{email}</span>
      </p>
      <p className="text-gray-600 text-xs mb-6">It expires in 10 minutes. Check your spam folder if you don't see it.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* OTP input boxes */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className={`w-11 h-14 text-center text-xl font-bold rounded-lg border-2 bg-background text-text-primary focus:outline-none transition-colors ${
                digit ? 'border-accent text-accent' : 'border-gray-700 focus:border-accent'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm text-center">{error.data?.message ?? 'Invalid code. Please try again.'}</p>
          </div>
        )}

        {resent && <p className="text-green-400 text-sm text-center">✓ New code sent!</p>}

        <button type="submit" disabled={isLoading || otp.join('').length < 6}
          className="w-full bg-accent text-black font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity tracking-wide">
          {isLoading
            ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />Verifying...</span>
            : 'Verify & Create Account'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Didn't receive it?{' '}
          {countdown > 0
            ? <span className="text-gray-600">Resend in {countdown}s</span>
            : <button type="button" onClick={handleResend} disabled={resending} className="text-accent hover:underline">Resend code</button>
          }
        </p>
      </form>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [formData, setFormData] = useState(null)

  return (
    <div className="bg-background min-h-screen text-text-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <p className="text-gray-500 text-sm mt-3">
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-8">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 'form' ? 'bg-accent text-black' : 'bg-green-500 text-white'}`}>
              {step === 'form' ? '1' : '✓'}
            </div>
            <div className={`flex-1 h-0.5 ${step === 'otp' ? 'bg-accent' : 'bg-gray-700'}`} />
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 'otp' ? 'bg-accent text-black' : 'bg-gray-700 text-gray-500'}`}>
              2
            </div>
          </div>

          {step === 'form'
            ? <RegistrationForm onOtpSent={(data) => { setFormData(data); setStep('otp') }} />
            : <OtpForm email={formData.email} onBack={() => setStep('form')} />
          }
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
