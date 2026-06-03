'use client'

import { X, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface CustomizePanelProps {
  isOpen: boolean
  onClose: () => void
  visibleModules: Record<string, boolean>
  onModuleToggle: (moduleId: string) => void
}

export default function CustomizePanel({
  isOpen,
  onClose,
  visibleModules,
  onModuleToggle,
}: CustomizePanelProps) {
  const modules = [
    { id: 'financial_health', label: 'Financial Health', default: true },
    { id: 'revenue_growth', label: 'Revenue Growth', default: true },
    { id: 'customer_growth', label: 'Customer Growth', default: true },
    { id: 'employee_efficiency', label: 'Employee Efficiency', default: true },
    { id: 'project_delivery', label: 'Project Delivery', default: true },
    { id: 'customer_satisfaction', label: 'Customer Satisfaction', default: true },
    { id: 'risk_alerts', label: 'Risk Alerts', default: true },
    { id: 'purchase_health', label: 'Purchase Health', default: false },
    { id: 'quality_control', label: 'Quality Control', default: false },
    { id: 'inventory_supply', label: 'Inventory & Supply Chain', default: false },
    { id: 'ecommerce_analytics', label: 'Website / eCommerce', default: false },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 bg-card border-l border-border w-80 shadow-xl transition-transform duration-300 z-50 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Customize Dashboard</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Default Modules */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide opacity-70">
              Default Modules
            </h3>
            <div className="space-y-3">
              {modules.slice(0, 7).map((module) => (
                <div key={module.id} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground cursor-pointer">
                    {module.label}
                  </label>
                  <Switch
                    checked={visibleModules[module.id]}
                    onCheckedChange={() => onModuleToggle(module.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Optional Modules */}
          <div className="pt-4 mt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide opacity-70">
              Optional Modules
            </h3>
            <div className="space-y-3">
              {modules.slice(7).map((module) => (
                <div key={module.id} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground cursor-pointer">
                    {module.label}
                  </label>
                  <Switch
                    checked={visibleModules[module.id]}
                    onCheckedChange={() => onModuleToggle(module.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Toggle modules to customize your dashboard view
          </p>
        </div>
      </div>
    </>
  )
}
