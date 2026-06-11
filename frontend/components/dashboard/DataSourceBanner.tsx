'use client'
import { useEffect, useState } from 'react'
import { Power, Radio } from 'lucide-react'
import { useERPSession } from '@/lib/session-context'

/**
 * FIX 1 — Data source status bar.
 * Renders nothing in Supabase-only mode. When an ERP session is live it shows
 * a subtle green banner with the connected host, a "data as of" timestamp, and
 * a Disconnect action. Theme-aware + wraps cleanly on mobile.
 *
 * The host is read from the same localStorage entry the /connect page writes
 * (an optional extra `host` field). session-context ignores that field, so this
 * is purely presentational and touches none of the locked session logic.
 */
export default function DataSourceBanner({ viewMode }: { viewMode: 'supabase' | 'erp' }) {
  const { erpType, isConnected, clearSession } = useERPSession()
  const [host, setHost] = useState<string>('')
  const [asOf, setAsOf] = useState<string>('')

  useEffect(() => {
    if (!isConnected) return

    // Stamp the load time (client-only to avoid hydration mismatch).
    setAsOf(
      new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    )

    try {
      const raw = window.localStorage.getItem('sigzen_erp_session')
      if (raw) {
        const parsed = JSON.parse(raw) as { host?: string }
        if (parsed.host) setHost(parsed.host)
      }
    } catch {
      // ignore — host is optional decoration
    }
  }, [isConnected])

  // Only relevant in ERP mode, and only when a live session exists.
  if (viewMode !== 'erp' || !isConnected) return null

  const label = (erpType ?? 'ERP').replace(/^\w/, c => c.toUpperCase())

  return (
    <div className="mb-4 md:mb-6 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-4 py-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        {/* Live pulse + label */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <Radio className="w-4 h-4 text-emerald-400 flex-shrink-0 hidden sm:block" />
          <span className="text-sm font-semibold text-emerald-300 truncate">
            Live ERP Connected: {label}
          </span>
          {host && (
            <span className="text-xs text-emerald-400/70 font-mono truncate hidden md:inline">
              ({host})
            </span>
          )}
        </div>

        {/* Spacer + meta + action */}
        <div className="flex items-center gap-3 sm:ml-auto flex-wrap">
          {asOf && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Data as of {asOf}
            </span>
          )}
          <button
            onClick={() => clearSession()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}