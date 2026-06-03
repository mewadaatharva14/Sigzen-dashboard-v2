'use client'
import { TrendingUp, BarChart3, Users, Activity, Layout, Smile, AlertTriangle, ShoppingCart, Globe, Package, Download } from 'lucide-react'

interface ModuleCardProps {
  title: string
  icon: string
  insight: string
  children: React.ReactNode
  exportData?: any[]
  exportFilename?: string
}

function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row =>
    Object.values(row).map(val =>
      typeof val === 'string' && val.includes(',')
        ? `"${val}"`
        : val
    ).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ModuleCard({
  title,
  icon: iconName,
  insight,
  children,
  exportData,
  exportFilename,
}: ModuleCardProps) {
  const icons: Record<string, any> = {
    TrendingUp, BarChart3, Users, Activity,
    Layout, Smile, AlertTriangle,
    ShoppingCart, Globe, Package,
  }
  const Icon = icons[iconName] || TrendingUp

  return (
    <div className="group bg-card rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-primary/50">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {exportData && exportData.length > 0 && (
            <button
              onClick={() => exportToCSV(exportData, exportFilename || title)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View Details →
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
          {insight}
        </p>
      </div>
    </div>
  )
}