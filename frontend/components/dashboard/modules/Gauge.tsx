'use client'

export function Gauge({ value }: { value: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const getColor = (val: number) => {
    if (val >= 60) return '#10b981'
    if (val >= 40) return '#fbbf24'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="80" viewBox="0 0 120 80">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* Background Arc */}
        <path
          d="M 10 70 A 40 40 0 0 1 110 70"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d="M 10 70 A 40 40 0 0 1 110 70"
          fill="none"
          stroke={getColor(value)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        {/* Center Text */}
        <text x="60" y="55" textAnchor="middle" className="text-xl font-bold fill-foreground">
          {value}
        </text>
        <text x="60" y="70" textAnchor="middle" className="text-xs fill-muted-foreground">
          NPS Score
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">
        {value >= 60 ? 'Promoter Zone' : value >= 40 ? 'Passive Zone' : 'Detractor Zone'}
      </p>
    </div>
  )
}
