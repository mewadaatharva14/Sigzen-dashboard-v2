import { useEffect, useState } from 'react'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncState<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  })

  useEffect(() => {
    if (!immediate) return

    let isMounted = true

    const execute = async () => {
      try {
        setState({ data: null, loading: true, error: null })
        const response = await asyncFunction()
        if (isMounted) {
          setState({ data: response, loading: false, error: null })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      }
    }

    execute()

    return () => {
      isMounted = false
    }
  }, [asyncFunction, immediate])

  return state
}
