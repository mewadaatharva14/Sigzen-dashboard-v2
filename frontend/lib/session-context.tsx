'use client'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const STORAGE_KEY = 'sigzen_erp_session'

interface StoredSession {
  session_id: string
  erp_type: string
}

interface ERPSessionContextType {
  sessionId: string | null
  erpType: string | null
  isConnected: boolean
  /** True until the initial localStorage + validation check completes. */
  isLoading: boolean
  clearSession: () => Promise<void>
}

const ERPSessionContext = createContext<ERPSessionContextType>({
  sessionId: null,
  erpType: null,
  isConnected: false,
  isLoading: true,
  clearSession: async () => {},
})

function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredSession>
    if (parsed.session_id && parsed.erp_type) {
      return { session_id: parsed.session_id, erp_type: parsed.erp_type }
    }
    return null
  } catch {
    return null
  }
}

export function ERPSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [erpType, setErpType] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // On mount: read localStorage and validate the session with the backend.
  useEffect(() => {
    let active = true

    async function validate() {
      const stored = readStoredSession()
      if (!stored) {
        if (active) {
          setIsConnected(false)
          setIsLoading(false)
        }
        return
      }

      try {
        const res = await fetch(
          `${API_BASE}/api/session/${stored.session_id}/status`
        )
        const data: { valid?: boolean; erp_type?: string } = await res.json()
        if (!active) return

        if (data.valid) {
          setSessionId(stored.session_id)
          setErpType(data.erp_type ?? stored.erp_type)
          setIsConnected(true)
        } else {
          window.localStorage.removeItem(STORAGE_KEY)
          setIsConnected(false)
        }
      } catch {
        if (active) setIsConnected(false)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    validate()
    return () => {
      active = false
    }
  }, [])

  const clearSession = useCallback(async () => {
    const current = sessionId ?? readStoredSession()?.session_id ?? null
    if (current) {
      try {
        await fetch(`${API_BASE}/api/connect/${current}`, {
          method: 'DELETE',
        })
      } catch {
        // best-effort — clear locally regardless
      }
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setSessionId(null)
    setErpType(null)
    setIsConnected(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/connect'
    }
  }, [sessionId])

  return (
    <ERPSessionContext.Provider
      value={{ sessionId, erpType, isConnected, isLoading, clearSession }}
    >
      {children}
    </ERPSessionContext.Provider>
  )
}

export function useERPSession() {
  return useContext(ERPSessionContext)
}