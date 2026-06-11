'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface YearContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  availableYears: number[]
  /** Years that exist in the Supabase historical dataset. */
  supabaseYears: number[]
  /** Years that exist in the connected live ERP (ERPNext). */
  erpnextYears: number[]
}

const YearContext = createContext<YearContextType>({
  selectedYear: 2024,
  setSelectedYear: () => {},
  availableYears: [],
  supabaseYears: [],
  erpnextYears: [],
})

export function YearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [supabaseYears, setSupabaseYears] = useState<number[]>([])
  const [erpnextYears, setErpnextYears] = useState<number[]>([])

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/years`)
      .then(res => res.json())
      .then(data => {
        const years: number[] = data.years || []
        const sbYears: number[] = data.supabase_years || []
        const erpYears: number[] = data.erpnext_years || []
        setAvailableYears(years)
        setSupabaseYears(sbYears)
        setErpnextYears(erpYears)
        // Default to the backend-provided default (latest Supabase year) so the
        // Supabase-driven dashboard is populated on first load — not the most
        // recent ERP year, which would leave historical modules blank.
        if (typeof data.default === 'number') {
          setSelectedYear(data.default)
        } else if (sbYears.length > 0) {
          setSelectedYear(sbYears[0])
        } else if (years.length > 0) {
          setSelectedYear(years[0])
        }
      })
      .catch(() => {
        const fallback = [2024, 2023, 2022, 2021]
        setAvailableYears(fallback)
        setSupabaseYears(fallback)
        setErpnextYears([])
        setSelectedYear(2024)
      })
  }, [])

  return (
    <YearContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        availableYears,
        supabaseYears,
        erpnextYears,
      }}
    >
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  return useContext(YearContext)
}
