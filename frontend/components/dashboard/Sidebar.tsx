'use client'
import { Home, TrendingUp, Users, Briefcase, Layout, AlertTriangle, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: TrendingUp, label: 'Financial', active: false },
    { icon: Users, label: 'Customers', active: false },
    { icon: Briefcase, label: 'Employees', active: false },
    { icon: Layout, label: 'Projects', active: false },
    { icon: AlertTriangle, label: 'Risk Alerts', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]

  return (
    <aside
      className={cn(
        'h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 overflow-hidden',
        isOpen ? 'w-60' : 'w-16'
      )}
    >
      {/* Brand */}
      <div className={cn(
        'flex items-center h-16 border-b border-sidebar-border flex-shrink-0',
        isOpen ? 'px-4 gap-3' : 'px-0 justify-center'
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 flex-shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        {isOpen && (
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-bold text-sidebar-foreground truncate">Sigzen BI</p>
            <p className="text-[11px] text-sidebar-foreground/60 truncate">CEO Command Center</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left',
                item.active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="px-2 py-4 border-t border-sidebar-border">
        <span className={cn(
          'flex items-center justify-center text-xs font-semibold text-sidebar-foreground/60 bg-sidebar-accent/20 rounded px-2 py-1'
        )}>
          {isOpen ? 'v1.0 Demo' : 'v1'}
        </span>
      </div>
    </aside>
  )
}