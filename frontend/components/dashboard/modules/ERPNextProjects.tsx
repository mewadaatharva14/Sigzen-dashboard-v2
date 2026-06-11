'use client'
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Layout, CheckCircle2, Clock, ListTodo, Flag } from 'lucide-react'
import ModuleCard from '../ModuleCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useERPSession } from '@/lib/session-context'
import { getSessionTasks, getSessionProjects } from '@/lib/erpnext-api'
import {
  ERPResponse, EMPTY_RESP, NotConnectedCard, EmptyState, StatTile,
  tooltipProps, statusColor, breakdownToData,
} from './erpnextShared'

function CountBar({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  if (data.length === 0) return <EmptyState message="No records found in ERPNext for this view." />
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} width={110} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="value" name={label} radius={[0, 6, 6, 0]}>
            {data.map((d, i) => <Cell key={i} fill={statusColor(d.name, i)} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ERPNextProjects() {
  const { sessionId, isConnected, isLoading: sessionLoading } = useERPSession()
  const [tab, setTab] = useState('tasks')
  const [tasks, setTasks] = useState<ERPResponse>(EMPTY_RESP)
  const [projects, setProjects] = useState<ERPResponse>(EMPTY_RESP)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !sessionId) { setLoading(false); return }
    async function load() {
      setLoading(true)
      try {
        const [t, p] = await Promise.all([getSessionTasks(sessionId!), getSessionProjects(sessionId!)])
        setTasks(t); setProjects(p)
      } finally { setLoading(false) }
    }
    load()
  }, [sessionId, isConnected])

  if (!isConnected && !sessionLoading) return <NotConnectedCard title="Projects (Live)" icon="Layout" />

  return (
    <ModuleCard
      title="Projects (Live)"
      icon="Layout"
      insight="Live project status, task completion and workload from ERPNext"
      exportData={tab === 'tasks' ? tasks.data : projects.data}
      exportFilename={`erpnext_projects_${tab}`}
    >
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <TabsList className="bg-[#1e293b]/60 border border-slate-800 p-0.5 rounded-lg">
            <TabsTrigger value="tasks" className="px-3 py-1.5 text-xs sm:text-sm">Tasks</TabsTrigger>
            <TabsTrigger value="projects" className="px-3 py-1.5 text-xs sm:text-sm">Projects</TabsTrigger>
          </TabsList>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Fetching live data...</span>
            </div>
          )}
        </div>

        {/* TASKS */}
        <TabsContent value="tasks" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total Tasks" value={tasks.summary.total_count ?? 0} accent="blue" icon={<ListTodo className="w-5 h-5" />} />
            <StatTile label="Completed" value={tasks.summary.completed_count ?? 0} accent="emerald" icon={<CheckCircle2 className="w-5 h-5" />} />
            <StatTile label="Open" value={tasks.summary.open_count ?? 0} accent="amber" icon={<Clock className="w-5 h-5" />} />
            <StatTile label="Completion" value={`${tasks.summary.completion_rate_pct ?? 0}%`} accent="indigo" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">By Status</p>
              <CountBar data={breakdownToData(tasks.summary.status_breakdown)} label="Tasks" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /> By Priority</p>
              <CountBar data={breakdownToData(tasks.summary.priority_breakdown)} label="Tasks" />
            </div>
          </div>
        </TabsContent>

        {/* PROJECTS */}
        <TabsContent value="projects" className="mt-0 outline-none">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total Projects" value={projects.summary.total_count ?? 0} accent="blue" icon={<Layout className="w-5 h-5" />} />
            <StatTile label="Open" value={projects.summary.open_count ?? 0} accent="amber" />
            <StatTile label="Completed" value={projects.summary.completed_count ?? 0} accent="emerald" />
            <StatTile label="Avg Progress" value={`${projects.summary.avg_progress_pct ?? 0}%`} accent="indigo" />
          </div>
          <CountBar data={breakdownToData(projects.summary.status_breakdown)} label="Projects" />
        </TabsContent>
      </Tabs>
    </ModuleCard>
  )
}
