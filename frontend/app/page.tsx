'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import CustomizePanel from '@/components/dashboard/CustomizePanel'
import ChatPanel from '@/components/dashboard/ChatPanel'
import { YearProvider } from '@/lib/yearContext'

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [customizePanelOpen, setCustomizePanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [visibleModules, setVisibleModules] = useState({
    financial_health: true,
    revenue_growth: true,
    customer_growth: true,
    employee_efficiency: true,
    project_delivery: true,
    customer_satisfaction: true,
    risk_alerts: true,
    purchase_health: false,
    quality_control: false,
    inventory_supply: false,
    ecommerce_analytics: false,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
      } else {
        setAuthChecked(true)
      }
    })

    const savedTheme = localStorage.getItem('dashboard-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')

    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('dashboard-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleModuleToggle = (moduleId: string) => {
    setVisibleModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId as keyof typeof prev]
    }))
  }

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Sigzen BI...</p>
        </div>
      </div>
    )
  }

  return (
    <YearProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`
          ${isMobile ? 'fixed z-30 h-full' : 'relative'}
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-60' : 'w-0 md:w-16'}
          overflow-hidden flex-shrink-0
        `}>
          <Sidebar isOpen={sidebarOpen} />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            onCustomizeClick={() => setCustomizePanelOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <DashboardGrid visibleModules={visibleModules} />
          </main>
        </div>

        <CustomizePanel
          isOpen={customizePanelOpen}
          onClose={() => setCustomizePanelOpen(false)}
          visibleModules={visibleModules}
          onModuleToggle={handleModuleToggle}
        />

        {/* AI Chat Panel */}
        <ChatPanel />
      </div>
    </YearProvider>
  )
}