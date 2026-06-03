// Format large INR numbers for charts and KPI cards
export function formatINR(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`
  }
  return `₹${value}`
}

// For chart Y-axis tick formatter
export function formatChartINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

// Format percentage
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}