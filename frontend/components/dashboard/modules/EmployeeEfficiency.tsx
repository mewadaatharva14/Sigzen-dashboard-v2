'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import ModuleCard from '../ModuleCard'
import { supabase } from '@/lib/supabase'

export default function EmployeeEfficiency() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Step 1 — Get departments using correct column name
        const { data: depts, error: deptError } = await supabase
          .from('departments')
          .select('id, dept_name')

        if (deptError) throw deptError
        if (!depts || depts.length === 0) {
          setLoading(false)
          return
        }

        // Step 2 — Get latest month available
        const { data: latestRow, error: latestError } = await supabase
          .from('employee_monthly_metrics')
          .select('month')
          .order('month', { ascending: false })
          .limit(1)
          .single()

        if (latestError || !latestRow) {
          setLoading(false)
          return
        }

        // Step 3 — Get all active employees
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('id, department_id')
          .eq('employment_status', 'Active')

        if (empError || !employees) {
          setLoading(false)
          return
        }

        // Step 4 — Get utilization for latest month
        const { data: metrics, error: metricsError } = await supabase
          .from('employee_monthly_metrics')
          .select('employee_id, utilization_rate')
          .eq('month', latestRow.month)

        if (metricsError || !metrics) {
          setLoading(false)
          return
        }

        // Step 5 — Build lookup maps
        const deptMap: Record<number, string> = {}
        depts.forEach((d: any) => {
          deptMap[d.id] = d.dept_name
        })

        const empDeptMap: Record<number, number> = {}
        employees.forEach((e: any) => {
          empDeptMap[e.id] = e.department_id
        })

        // Step 6 — Group utilization by department
        const deptUtilization: Record<string, number[]> = {}
        metrics.forEach((m: any) => {
          const deptId = empDeptMap[m.employee_id]
          if (!deptId) return
          const deptName = deptMap[deptId]
          if (!deptName) return
          if (!deptUtilization[deptName]) deptUtilization[deptName] = []
          deptUtilization[deptName].push(Number(m.utilization_rate || 0))
        })

        // Step 7 — Calculate averages
        const result = Object.entries(deptUtilization)
          .map(([dept, values]) => ({
            dept,
            utilization: Math.round(
              values.reduce((a, b) => a + b, 0) / values.length
            ),
          }))
          .sort((a, b) => b.utilization - a.utilization)

        setData(result)
      } catch (err) {
        console.error('EmployeeEfficiency error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getColor = (utilization: number) => {
    if (utilization >= 90) return '#10b981'
    if (utilization >= 80) return '#3b82f6'
    if (utilization >= 70) return '#fbbf24'
    return '#ef4444'
  }

  const topDept = data[0]
  const insight = topDept
    ? `${topDept.dept} at ${topDept.utilization}% — highest utilization`
    : 'Employee utilization by department'

  return (
    <ModuleCard
      title="Employee Efficiency"
      icon="Activity"
      insight={insight}
      exportData={data}
      exportFilename="employee_efficiency"
    >
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              No utilization data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 130, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                type="number"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                dataKey="dept"
                type="category"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fontSize: 11 }}
                width={125}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                }}
                formatter={(value: any) => [`${value}%`, 'Utilization']}
              />
              <Bar dataKey="utilization" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={getColor(entry.utilization)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ModuleCard>
  )
}