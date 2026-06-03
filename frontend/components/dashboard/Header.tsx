'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Sun, Moon, Bell, LogOut, User, ChevronDown, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { useYear } from '@/lib/yearContext'

interface HeaderProps {
  onMenuClick: () => void
  theme: string
  onThemeToggle: () => void
  onCustomizeClick: () => void
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Header({
  onMenuClick,
  theme,
  onThemeToggle,
  onCustomizeClick,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('')
  const [userName, setUserName] = useState('CEO')
  const [userEmail, setUserEmail] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [yearMenuOpen, setYearMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)
  const { selectedYear, setSelectedYear, availableYears } = useYear()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name ||
          user.email?.split('@')[0] || 'CEO'
        setUserName(name)
        setUserEmail(user.email || '')
      }
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
        setYearMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      setCurrentTime(`${dateString} • ${timeString}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut()
    window.location.href = '/login'
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 md:px-6 gap-4 z-40 shadow-sm flex-shrink-0">

      {/* Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="text-foreground hover:bg-muted flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
            Sigzen BI
          </h1>
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:block">
            CEO Command Center
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Live Time */}
        <div className="text-xs md:text-sm text-muted-foreground font-medium hidden lg:block">
          {currentTime}
        </div>

        {/* Year Filter Dropdown */}
        <div className="relative" ref={yearRef}>
          <button
            onClick={() => setYearMenuOpen(!yearMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm font-medium text-blue-400 transition-all duration-200"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{selectedYear}</span>
            <ChevronDown className={cn(
              "w-3.5 h-3.5 transition-transform",
              yearMenuOpen && "rotate-180"
            )} />
          </button>

          {yearMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-36 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Filter by Year
                </p>
              </div>
              <div className="py-1">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year)
                      setYearMenuOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left",
                      selectedYear === year
                        ? "bg-blue-600/20 text-blue-400 font-semibold"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{year}</span>
                    {selectedYear === year && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className="text-foreground hover:bg-muted"
        >
          {theme === 'dark'
            ? <Sun className="w-5 h-5" />
            : <Moon className="w-5 h-5" />
          }
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>

        {/* User Menu */}
        <div className="relative pl-2 md:pl-3 border-l border-border" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden md:block">
              <span className="block text-sm font-medium text-foreground leading-tight">
                {userName}
              </span>
              <span className="block text-xs text-muted-foreground leading-tight">
                {userEmail}
              </span>
            </div>
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className="text-white font-bold text-sm bg-gradient-to-br from-blue-500 to-purple-500">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform hidden md:block",
              userMenuOpen && "rotate-180"
            )} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile Settings
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}