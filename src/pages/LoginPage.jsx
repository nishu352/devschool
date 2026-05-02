import { useState } from 'react'
import AppLogo from '../components/AppLogo'
import { useApp } from '../context/AppContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const { actions } = useApp()
  const [tab, setTab] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const clearFeedback = () => {
    setError(null)
    setMessage(null)
  }

  const onSignIn = async (event) => {
    event.preventDefault()
    if (!isSupabaseConfigured) return
    clearFeedback()
    setLoading(true)
    const { error: err } = await actions.signInWithPassword(email, password)
    setLoading(false)
    if (err) setError(err.message)
  }

  const onSignUp = async (event) => {
    event.preventDefault()
    if (!isSupabaseConfigured) return
    clearFeedback()
    setLoading(true)
    const { data, error: err } = await actions.signUp(email, password, displayName)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    if (data.session) {
      setMessage('Welcome! You are signed in.')
    } else {
      setMessage('Check your email to confirm your account before signing in.')
    }
  }

  const onGuestContinue = (event) => {
    event.preventDefault()
    clearFeedback()
    actions.guestLogin(guestName)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <div className="w-full max-w-sm space-y-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
          <div className="mb-6 flex items-center gap-3">
            <AppLogo size={36} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">DevSchool Pro</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Sign in to sync your lessons and progress.</p>
            </div>
          </div>

          {!isSupabaseConfigured ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              Supabase auth is optional. Create a `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
              your{' '}
              <a href="https://supabase.com/dashboard/project/_/settings/api" className="font-semibold underline">
                Supabase project API settings
              </a>{' '}
              to enable email sign up / sign in, or continue offline below.
            </div>
          ) : (
            <>
              <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
                <TabButton active={tab === 'signIn'} onClick={() => { setTab('signIn'); clearFeedback() }}>
                  Sign in
                </TabButton>
                <TabButton active={tab === 'signUp'} onClick={() => { setTab('signUp'); clearFeedback() }}>
                  Sign up
                </TabButton>
              </div>

              <form className="mt-5 space-y-4" onSubmit={tab === 'signIn' ? onSignIn : onSignUp}>
                {tab === 'signUp' ? (
                  <Field
                    label="Display name"
                    type="text"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How we greet you"
                  />
                ) : null}
                <Field
                  label="Email"
                  type="email"
                  autoComplete={tab === 'signIn' ? 'email' : 'username'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <Field
                  label="Password"
                  type="password"
                  autoComplete={tab === 'signIn' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? 'Please wait…' : tab === 'signIn' ? 'Sign in' : 'Create account'}
                </button>
              </form>
            </>
          )}

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
              {message}
            </p>
          ) : null}
        </div>

        {!isSupabaseConfigured ? (
          <form
            onSubmit={onGuestContinue}
            className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 dark:border-slate-600 dark:bg-slate-800/80"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Continue offline</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Practice on this device without an account.</p>
            <label className="mt-4 block text-sm font-medium">Your name</label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Learner"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-slate-800 px-4 py-3 text-base font-semibold text-white hover:bg-slate-900 dark:bg-blue-900 dark:hover:bg-blue-950"
            >
              Start learning
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <input
        {...inputProps}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  )
}
