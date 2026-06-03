'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface YearContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  availableYears: number[]
}

const YearContext = createContext<YearContextType>({
  selectedYear: 2024,
  setSelectedYear: () => {},
  availableYears: [],
})

export function YearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/years`)
      .then(res => res.json())
      .then(data => {
        const years = data.years || []
        setAvailableYears(years)
        // Use the most recent year from DB not current calendar year
        if (years.length > 0) {
          setSelectedYear(years[0])
        }
      })
      .catch(() => {
        setAvailableYears([2024, 2023, 2022, 2021])
        setSelectedYear(2024)
      })
  }, [])

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, availableYears }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  return useContext(YearContext)
}