'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, Users, Activity, AlertTriangle } from 'lucide-react'
import { SparklineChart } from './SparklineChart'

interface KPICardProps {
  title: string
  value: string
  change: string
  subtitle: string
  color: string
  icon: string
}

export default function KPICard({
  title,
  value,
  change,
  subtitle,
  color,
  icon: iconName,
}: KPICardProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''))
    if (!numericValue) return
    let currentValue = 0
    const increment = numericValue / 30
    const timer = setInterval(() => {
      currentValue += increment
      if (currentValue >= numericValue) {
        setAnimatedValue(numericValue)
        clearInterval(timer)
      } else {
        setAnimatedValue(Math.floor(currentValue))
      }
    }, 10)
    return () => clearInterval(timer)
  }, [value])

  const icons: Record<string, any> = {
    TrendingUp,
    Users,
    Activity,
    AlertTriangle,
  }
  const Icon = icons[iconName] || TrendingUp

  // Extract color class for glow effect
  const glowColor: Record<string, string> = {
    'from-emerald-500 to-teal-500': 'rgba(16, 185, 129, 0.3)',
    'from-blue-500 to-cyan-500': 'rgba(59, 130, 246, 0.3)',
    'from-purple-500 to-pink-500': 'rgba(168, 85, 247, 0.3)',
    'from-red-500 to-orange-500': 'rgba(239, 68, 68, 0.3)',
  }

  const glow = glowColor[color] || 'rgba(59, 130, 246, 0.3)'

  return (
    <div
      className="relative rounded-xl p-px overflow-hidden cursor-pointer"
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${glow.replace('0.3', '0.8')}, transparent)`
          : 'transparent',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Glow border on hover */}
      <div
        className="absolute inset-0 rounded-xl transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${glow}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div
        className="relative bg-card rounded-xl p-4 md:p-6 border border-border/50 transition-all duration-300"
        style={{
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered
            ? `0 20px 40px ${glow}, 0 0 0 1px ${glow}`
            : '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-1 truncate">
              {title}
            </h3>
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {value}
            </p>
          </div>
          <div
            className={`p-2 md:p-3 bg-gradient-to-br ${color} rounded-lg text-white shadow-lg flex-shrink-0 ml-2 transition-transform duration-300`}
            style={{
              transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
            }}
          >
            <Icon className="w-4 h-4 md:w-6 md:h-6" />
          </div>
        </div>

        {/* Change indicator */}
        <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-b border-border/50">
          <p
            className="text-xs md:text-sm font-semibold mb-1 transition-colors duration-300"
            style={{ color: hovered ? '#34d399' : '#10b981' }}
          >
            {change}
          </p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        {/* Sparkline */}
        <SparklineChart />
      </div>
    </div>
  )
}