"use client"

import { useState, useEffect, useRef } from "react"

// Types
interface WeeklyData {
  week: string
  revenue: number
  foodCost: number
  foodCostPct: number
  customers: number
  orders: number
  avgOrderValue: number
}

interface CategoryCost {
  category: string
  cost: number
  revenue: number
  costPct: number
  target: number
  emoji: string
}

interface DailyRevenue {
  day: string
  revenue: number
  foodCost: number
}

interface MenuItem {
  name: string
  orders: number
  revenue: number
  cost: number
  emoji: string
}

interface Alert {
  id: number
  type: "warning" | "danger" | "success"
  message: string
  category: string
  timestamp: string
}

// Mock Data
const generateWeeklyData = (): WeeklyData[] => [
  { week: "Week 1 (Jan 1-7)", revenue: 18420, foodCost: 5894, foodCostPct: 32.0, customers: 612, orders: 734, avgOrderValue: 25.1 },
  { week: "Week 2 (Jan 8-14)", revenue: 21350, foodCost: 7259, foodCostPct: 34.0, customers: 708, orders: 856, avgOrderValue: 24.9 },
  { week: "Week 3 (Jan 15-21)", revenue: 19870, foodCost: 7150, foodCostPct: 36.0, customers: 661, orders: 794, avgOrderValue: 25.0 },
  { week: "Week 4 (Jan 22-28)", revenue: 23100, foodCost: 7392, foodCostPct: 32.0, customers: 769, orders: 924, avgOrderValue: 25.0 },
]

const generateDailyData = (): DailyRevenue[] => [
  { day: "Mon", revenue: 2840, foodCost: 910 },
  { day: "Tue", revenue: 3120, foodCost: 1060 },
  { day: "Wed", revenue: 3560, foodCost: 1210 },
  { day: "Thu", revenue: 4200, foodCost: 1470 },
  { day: "Fri", revenue: 5800, foodCost: 2030 },
  { day: "Sat", revenue: 6200, foodCost: 2170 },
  { day: "Sun", revenue: 4100, foodCost: 1435 },
]

const generateCategoryData = (): CategoryCost[] => [
  { category: "Mansaf & Lamb", cost: 3240, revenue: 8900, costPct: 36.4, target: 32, emoji: "🍖" },
  { category: "Falafel & Hummus", cost: 890, revenue: 4200, costPct: 21.2, target: 25, emoji: "🧆" },
  { category: "Shawarma", cost: 1560, revenue: 5100, costPct: 30.6, target: 30, emoji: "🥙" },
  { category: "Salads & Sides", cost: 420, revenue: 1800, costPct: 23.3, target: 28, emoji: "🥗" },
  { category: "Beverages", cost: 280, revenue: 1400, costPct: 20.0, target: 22, emoji: "🍵" },
  { category: "Desserts", cost: 380, revenue: 1200, costPct: 31.7, target: 30, emoji: "🍮" },
]

const generateMenuItems = (): MenuItem[] => [
  { name: "Mansaf (Full)", orders: 312, revenue: 5616, cost: 2085, emoji: "🍖" },
  { name: "Chicken Shawarma", orders: 487, revenue: 5844, cost: 1753, emoji: "🥙" },
  { name: "Falafel Plate", orders: 398, revenue: 3980, cost: 796, emoji: "🧆" },
  { name: "Hummus Bowl", orders: 276, revenue: 2208, cost: 441, emoji: "🫙" },
  { name: "Mixed Grill", orders: 189, revenue: 4914, cost: 1720, emoji: "🔥" },
]

const generateAlerts = (): Alert[] => [
  { id: 1, type: "danger", message: "Mansaf & Lamb food cost 36.4% — exceeds 32% target by 4.4%", category: "Mansaf & Lamb", timestamp: "Today, 9:00 AM" },
  { id: 2, type: "warning", message: "Desserts category at 31.7% — 1.7% above target threshold", category: "Desserts", timestamp: "Today, 9:00 AM" },
  { id: 3, type: "warning", message: "Week 3 overall food cost reached 36% — review lamb supplier pricing", category: "Overall", timestamp: "Jan 21, 11:30 PM" },
  { id: 4, type: "success", message: "Falafel & Hummus at 21.2% — 3.8% below target, excellent margin", category: "Falafel & Hummus", timestamp: "Today, 9:00 AM" },
  { id: 5, type: "success", message: "Beverages at 20% — performing well below 22% target", category: "Beverages", timestamp: "Today, 9:00 AM" },
]

// Utility
function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatPct(n: number) {
  return n.toFixed(1) + "%"
}

// Sparkline SVG
function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 32
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Bar Chart
function BarChart({ data, maxVal, colorFn }: { data: { label: string; value: number; emoji: string }[]; maxVal: number; colorFn: (v: number) => string }) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-lg w-6">{item.emoji}</span>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-zinc-400 truncate max-w-[120px]">{item.label}</span>
              <span className="text-xs font-semibold text-zinc-200">{formatCurrency(item.value)}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: colorFn(item.value) }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Revenue Line Chart (SVG)
function RevenueLineChart({ data }: { data: DailyRevenue[] }) {
  const w = 600
  const h = 140
  const padL = 50
  const padR = 20
  const padT = 10
  const padB = 30
  const chartW = w - padL - padR
  const chartH = h - padT - padB

  const maxRev = Math.max(...data.map(d => d.revenue))
  const maxCost = Math.max(...data.map(d => d.foodCost))
  const maxVal = Math.max(maxRev, maxCost)

  const revPoints = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * chartW
    const y = padT + chartH - (d.revenue / maxVal) * chartH
    return `${x},${y}`
  }).join(" ")

  const costPoints = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * chartW
    const y = padT + chartH - (d.foodCost / maxVal) * chartH
    return `${x},${y}`
  }).join(" ")

  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    val: Math.round(maxVal * t / 1000),
    y: padT + chartH - t * chartH,
  }))

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[320px]" style={{ height: h }}>
        {/* Grid lines */}
        {yLabels.map((l, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={l.y} y2={l.y} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4,4" />
            <text x={padL - 6} y={l.y + 4} textAnchor="end" fontSize="10" fill="#71717a">${l.val}k</text>
          </g>
        ))}
        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={padL + (i / (data.length - 1)) * chartW} y={h - 6} textAnchor="middle" fontSize="11" fill="#a1a1aa">{d.day}</text>
        ))}
        {/* Revenue line */}
        <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" points={revPoints} strokeLinecap="round" strokeLinejoin="round" />
        {/* Food cost line */}
        <polyline fill="none" stroke="#ef4444" strokeWidth="2" points={costPoints} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" />
        {/* Dots for revenue */}
        {data.map((d, i) => (
          <circle key={i} cx={padL + (i / (data.length - 1)) * chartW} cy={padT + chartH - (d.revenue / maxVal) * chartH} r="3.5" fill="#f59e0b" />
        ))}
      </svg>
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-amber-400 inline-block" /><span className="text-xs text-zinc-400">Revenue</span></div>
        <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-red-400 inline-block border-dashed border-t-2 border-red-400" /><span className="text-xs text-zinc-400">Food Cost</span></div>
      </div>
    </div>
  )
}

// Donut Chart SVG
function DonutChart({ categories }: { categories: CategoryCost[] }) {
  const total = categories.reduce((s, c) => s + c.revenue, 0)
  const colors = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#f97316", "#ec4899"]
  let cumAngle = -Math.PI / 2
  const cx = 80, cy = 80, r = 60, innerR = 35
  const slices = categories.map((cat, i) => {
    const pct = cat.revenue / total
    const angle = pct * 2 * Math.PI
    const x1 = cx + r * Math.cos(cumAngle)
    const y1 = cy + r * Math.sin(cumAngle)
    const x2 = cx + r * Math.cos(cumAngle + angle)
    const y2 = cy + r * Math.sin(cumAngle + angle)
    const ix1 = cx + innerR * Math.cos(cumAngle)
    const iy1 = cy + innerR * Math.sin(cumAngle)
    const ix2 = cx + innerR * Math.cos(cumAngle + angle)
    const iy2 = cy + innerR * Math.sin(cumAngle + angle)
    const large = angle > Math.PI ? 1 : 0
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`
    cumAngle += angle
    return { path, color: colors[i], pct, name: cat.category }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-40 h-40 flex-shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity="0.9" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#a1a1aa">Revenue</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="12" fill="#f4f4f5" fontWeight="bold">{formatCurrency(total)}</text>
      </svg>
      <div className="grid grid-cols-1 gap-2 flex-1 w-full">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i] }} />
            <span className="text-xs text-zinc-400 truncate flex-1">{cat.emoji} {cat.category}</span>
            <span className="text-xs font-semibold text-zinc-200">{formatCurrency(cat.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Component
export default function TasteOfAmmanDashboard() {
  const [selectedWeek, setSelectedWeek] = useState(3)
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "alerts" | "audit">("overview")
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exportedMsg, setExportedMsg] = useState("")

  const weeklyData =