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
  const erpModules = [
    { id: 'erpnext_accounting', label: 'Accounting' },
    { id: 'erpnext_sales_crm', label: 'Sales & CRM' },
    { id: 'erpnext_procurement', label: 'Procurement' },
    { id: 'erpnext_inventory', label: 'Inventory & Stock' },
    { id: 'erpnext_projects', label: 'Projects' },
    { id: 'erpnext_support', label: 'Support' },
  ]
  const defaultModules = [
    { id: 'financial_health', label: 'Financial Health' },
    { id: 'revenue_growth', label: 'Revenue Growth' },
    { id: 'customer_growth', label: 'Customer Growth' },
    { id: 'employee_efficiency', label: 'Employee Efficiency' },
    { id: 'project_delivery', label: 'Project Delivery' },
    { id: 'customer_satisfaction', label: 'Customer Satisfaction' },
    { id: 'risk_alerts', label: 'Risk Alerts' },
  ]
  const optionalModules = [
    { id: 'purchase_health', label: 'Purchase Health' },
    { id: 'quality_control', label: 'Quality Control' },
    { id: 'inventory_supply', label: 'Inventory & Supply Chain' },
    { id: 'ecommerce_analytics', label: 'Website / eCommerce' },
  ]

  const renderGroup = (title: string, items: { id: string; label: string }[], subtitle?: string) => (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1 uppercase tracking-wide opacity-70">
        {title}
      </h3>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      <div className="space-y-3 mt-3">
        {items.map((module) => (
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
  )

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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderGroup('Live ERP Modules', erpModules, 'Shown only while an ERP is connected')}
          <div className="pt-4 border-t border-border">
            {renderGroup('Default Modules', defaultModules)}
          </div>
          <div className="pt-4 border-t border-border">
            {renderGroup('Optional Modules', optionalModules)}
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
