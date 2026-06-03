'use client'
import { useState, useEffect } from 'react'
import { AlertCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ModuleCard from '../ModuleCard'
import { supabase } from '@/lib/supabase'

export default function RiskAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('risk_alerts')
          .select('id, alert_date, alert_type, severity, description, status, amount_at_risk')
          .order('alert_date', { ascending: false })
          .limit(6)

        if (error) throw error
        setAlerts(data || [])
      } catch (err) {
        console.error('RiskAlerts error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleResolve = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertOctagon className="w-5 h-5" />
      case 'High': return <AlertTriangle className="w-5 h-5" />
      case 'Medium': return <AlertCircle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border border-red-500/20'
      case 'High': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
      default: return 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/20 text-red-400'
      case 'High': return 'bg-orange-500/20 text-orange-400'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-blue-500/20 text-blue-400'
    }
  }

  const criticalCount = alerts.filter(a => a.severity === 'Critical').length
  const unresolvedCount = alerts.filter(a => a.status !== 'Resolved').length

  return (
    <ModuleCard
      title="Risk Alerts"
      icon="AlertTriangle"
      insight={
        criticalCount > 0
          ? `${criticalCount} critical — ${unresolvedCount} unresolved alerts`
          : 'No critical alerts at this time'
      }
      exportData={alerts}
      exportFilename="risk_alerts"
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground text-sm">No risk alerts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] ${getSeverityStyle(alert.severity)}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`p-2 rounded-lg ${getSeverityStyle(alert.severity)}`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-1">
                {alert.alert_type}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {alert.description}
              </p>
              {alert.amount_at_risk && (
                <p className="text-xs font-medium text-orange-400 mb-2">
                  ₹{(Number(alert.amount_at_risk) / 100000).toFixed(1)}L at risk
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  {alert.alert_date
                    ? new Date(alert.alert_date).toLocaleDateString('en-IN')
                    : '—'
                  }
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs hover:bg-white/10"
                  onClick={() => handleResolve(alert.id)}
                >
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModuleCard>
  )
}