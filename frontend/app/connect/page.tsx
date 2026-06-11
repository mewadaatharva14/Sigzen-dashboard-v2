'use client'
import { useState, useEffect, ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3, Loader2, CheckCircle2, AlertCircle, ArrowRight,
  ArrowLeft, Lock, Boxes, Database, Server, Calculator, HardDrive,
} from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const STORAGE_KEY = 'sigzen_erp_session'

interface CredentialField {
  key: string
  label: string
  placeholder: string
  type: string
}

interface SupportedERP {
  id: string
  name: string
  logo: string
  enabled: boolean
  credential_fields: CredentialField[]
}

interface ConnectResponse {
  success: boolean
  session_id?: string
  user?: string
  erp_type?: string
  expires_in?: number
  error?: string
}

interface ErpVisual {
  icon: ComponentType<{ className?: string }>
  gradient: string
}

// Visual identity per ERP (icon + brand-ish gradient). Falls back gracefully.
const ERP_VISUALS: Record<string, ErpVisual> = {
  erpnext: { icon: Boxes, gradient: 'from-emerald-500 to-teal-600' },
  sap: { icon: Database, gradient: 'from-blue-500 to-indigo-600' },
  oracle: { icon: Server, gradient: 'from-red-500 to-rose-600' },
  mysql: { icon: HardDrive, gradient: 'from-sky-500 to-cyan-600' },
  tally: { icon: Calculator, gradient: 'from-indigo-500 to-purple-600' },
}
const DEFAULT_VISUAL: ErpVisual = { icon: Database, gradient: 'from-slate-500 to-slate-600' }

// Coming-soon systems surfaced in the UI even if the backend doesn't list them
// yet. They are display-only (disabled) — no functional path is added.
const EXTRA_COMING_SOON: SupportedERP[] = [
  { id: 'mysql', name: 'MySQL', logo: 'mysql', enabled: false, credential_fields: [] },
  { id: 'tally', name: 'Tally', logo: 'tally', enabled: false, credential_fields: [] },
]

export default function ConnectPage() {
  const router = useRouter()

  const [erps, setErps] = useState<SupportedERP[]>([])
  const [loadingErps, setLoadingErps] = useState(true)
  const [selectedErp, setSelectedErp] = useState<SupportedERP | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})

  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [connectedUser, setConnectedUser] = useState('')

  // Load supported ERPs dynamically, then merge display-only coming-soon ones.
  useEffect(() => {
    let active = true
    fetch(`${API_BASE}/api/connectors`)
      .then(res => res.json())
      .then((data: SupportedERP[]) => {
        if (!active) return
        const merged = [
          ...data,
          ...EXTRA_COMING_SOON.filter(e => !data.some(d => d.id === e.id)),
        ]
        setErps(merged)
      })
      .catch(() => {
        if (!active) return
        setErps(EXTRA_COMING_SOON)
        setError('Could not reach the backend. Is it running?')
      })
      .finally(() => {
        if (active) setLoadingErps(false)
      })
    return () => {
      active = false
    }
  }, [])

  function selectErp(erp: SupportedERP) {
    if (!erp.enabled) return
    setSelectedErp(erp)
    setCredentials(
      Object.fromEntries(erp.credential_fields.map(f => [f.key, '']))
    )
    setError('')
    setConnectedUser('')
  }

  function updateField(key: string, value: string) {
    setCredentials(prev => ({ ...prev, [key]: value }))
    setConnectedUser('')
    setError('')
  }

  const allFilled =
    selectedErp != null &&
    selectedErp.credential_fields.every(f => credentials[f.key]?.trim())

  function deriveHost(): string {
    const url = credentials['url'] || ''
    try {
      return new URL(url).host
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    }
  }

  async function handleTestConnection() {
    if (!selectedErp || !allFilled) return
    setTesting(true)
    setError('')
    setConnectedUser('')

    try {
      const res = await fetch(`${API_BASE}/api/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ erp_type: selectedErp.id, credentials }),
      })
      const data: ConnectResponse = await res.json()

      if (data.success && data.session_id) {
        // host is an optional extra field; session-context ignores it and
        // only the dashboard banner reads it.
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            session_id: data.session_id,
            erp_type: data.erp_type ?? selectedErp.id,
            host: deriveHost(),
          })
        )
        setConnectedUser(data.user || 'Connected')
      } else {
        setError(data.error || 'Connection failed. Check your credentials.')
      }
    } catch (err) {
      setError(`Could not reach the backend: ${String(err)}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#0b1120] p-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/30">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Sigzen BI</h1>
          <p className="text-slate-400 mt-1">Connect your ERP System</p>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50">

          {!selectedErp ? (
            <>
              {/* ── STEP 1: ERP SELECTOR ─────────────────────────── */}
              <h2 className="text-base font-semibold text-white mb-1">
                Select your ERP system
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                Choose a system to connect. More integrations are on the way.
              </p>

              {loadingErps ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading available systems...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {erps.map(erp => {
                    const visual = ERP_VISUALS[erp.id] ?? DEFAULT_VISUAL
                    const Icon = visual.icon
                    return (
                      <button
                        key={erp.id}
                        type="button"
                        disabled={!erp.enabled}
                        onClick={() => selectErp(erp)}
                        className={[
                          'group relative flex flex-col items-center justify-center gap-3 rounded-xl border p-4 sm:p-5 transition-all',
                          erp.enabled
                            ? 'border-slate-700 bg-[#0f172a] hover:border-emerald-500/60 hover:bg-emerald-500/[0.04] cursor-pointer'
                            : 'border-slate-800 bg-[#0f172a]/50 cursor-not-allowed',
                        ].join(' ')}
                      >
                        <div
                          className={[
                            'flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform',
                            visual.gradient,
                            erp.enabled ? 'group-hover:scale-105' : 'opacity-40 grayscale',
                          ].join(' ')}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={erp.enabled ? 'text-sm font-medium text-slate-200' : 'text-sm font-medium text-slate-500'}>
                          {erp.name}
                        </span>
                        {erp.enabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            ● Available
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* ── STEP 2: CREDENTIAL FORM (slides in) ──────────── */}
              <div className="flex items-center gap-3 mb-5">
                {(() => {
                  const visual = ERP_VISUALS[selectedErp.id] ?? DEFAULT_VISUAL
                  const Icon = visual.icon
                  return (
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br text-white shadow ${visual.gradient}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  )
                })()}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-white leading-tight">
                    {selectedErp.name} Credentials
                  </h2>
                  <p className="text-xs text-slate-400">Enter your API access details</p>
                </div>
                {!connectedUser && (
                  <button
                    type="button"
                    onClick={() => setSelectedErp(null)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change
                  </button>
                )}
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {connectedUser ? (
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 mb-3">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Connected successfully</h3>
                    <p className="text-sm text-slate-400 mt-1 mb-6">
                      Authenticated as <span className="text-emerald-400 font-medium">{connectedUser}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      View Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {selectedErp.credential_fields.map(field => (
                        <div key={field.key}>
                          <label className="block text-sm text-slate-400 mb-1">
                            {field.label}
                          </label>
                          <input
                            type={field.type === 'password' ? 'password' : 'text'}
                            value={credentials[field.key] ?? ''}
                            onChange={e => updateField(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            autoComplete="off"
                            className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={!allFilled || testing}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {testing && <Loader2 className="w-4 h-4 animate-spin" />}
                      {testing ? 'Testing connection...' : 'Test Connection'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Credentials are never stored. Session expires in 8 hours.</span>
        </div>

        {/* Skip to Supabase-only dashboard */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
          >
            Skip — continue without ERP (Supabase-only mode) →
          </button>
        </div>
      </div>
    </div>
  )
}
