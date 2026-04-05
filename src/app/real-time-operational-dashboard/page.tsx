"use client"

import { useState, useEffect, useCallback } from "react"

// Types
interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  cost: number
  ordersToday: number
  emoji: string
}

interface Order {
  id: string
  time: string
  items: string[]
  total: number
  type: "dine-in" | "delivery"
  shift: "morning" | "afternoon" | "evening"
}

interface ShiftSummary {
  name: string
  hours: string
  revenue: number
  orders: number
  avgTicket: number
  topItem: string
}

interface HourlyRevenue {
  hour: string
  revenue: number
  orders: number
}

interface DailyRevenue {
  day: string
  revenue: number
  orders: number
}

// Mock data generation
const generateMockMenuItems = (): MenuItem[] => [
  { id: "1", name: "Mansaf", category: "Mains", price: 24, cost: 8.5, ordersToday: 47, emoji: "🍲" },
  { id: "2", name: "Shawarma Plate", category: "Mains", price: 18, cost: 5.2, ordersToday: 89, emoji: "🥙" },
  { id: "3", name: "Falafel Platter", category: "Appetizers", price: 12, cost: 2.8, ordersToday: 112, emoji: "🧆" },
  { id: "4", name: "Hummus Bowl", category: "Appetizers", price: 10, cost: 2.1, ordersToday: 95, emoji: "🫙" },
  { id: "5", name: "Maqluba", category: "Mains", price: 22, cost: 9.2, ordersToday: 34, emoji: "🍛" },
  { id: "6", name: "Lamb Kebab", category: "Grills", price: 26, cost: 12.4, ordersToday: 28, emoji: "🍢" },
  { id: "7", name: "Tabbouleh", category: "Salads", price: 9, cost: 1.8, ordersToday: 78, emoji: "🥗" },
  { id: "8", name: "Fattoush Salad", category: "Salads", price: 9, cost: 2.0, ordersToday: 63, emoji: "🥙" },
  { id: "9", name: "Jordanian Tea", category: "Beverages", price: 5, cost: 0.8, ordersToday: 142, emoji: "🫖" },
  { id: "10", name: "Kunafa", category: "Desserts", price: 11, cost: 3.5, ordersToday: 55, emoji: "🍮" },
  { id: "11", name: "Special Lamb Ouzi", category: "Mains", price: 32, cost: 16.8, ordersToday: 12, emoji: "🐑" },
  { id: "12", name: "Fresh Lemonade", category: "Beverages", price: 6, cost: 1.2, ordersToday: 98, emoji: "🍋" },
]

const generateHourlyData = (): HourlyRevenue[] => {
  const hours = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM"]
  return hours.map((hour, i) => {
    const base = [120, 180, 320, 580, 640, 520, 280, 210, 390, 680, 720, 640, 480][i]
    return {
      hour,
      revenue: base + Math.floor(Math.random() * 80 - 40),
      orders: Math.floor(base / 18) + Math.floor(Math.random() * 5),
    }
  })
}

const generateDailyData = (): DailyRevenue[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const bases = [2800, 3100, 3400, 3900, 4800, 5200, 4600]
  return days.map((day, i) => ({
    day,
    revenue: bases[i] + Math.floor(Math.random() * 400 - 200),
    orders: Math.floor(bases[i] / 18) + Math.floor(Math.random() * 10),
  }))
}

const generateShiftSummaries = (): ShiftSummary[] => [
  { name: "Morning Shift", hours: "9AM – 2PM", revenue: 1840, orders: 98, avgTicket: 18.77, topItem: "Falafel Platter" },
  { name: "Afternoon Shift", hours: "2PM – 6PM", revenue: 1220, orders: 64, avgTicket: 19.06, topItem: "Hummus Bowl" },
  { name: "Evening Shift", hours: "6PM – 10PM", revenue: 2480, orders: 124, avgTicket: 20.0, topItem: "Mansaf" },
]

// Mini bar chart component
const MiniBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="w-full bg-zinc-800 rounded-full h-2">
    <div
      className={`h-2 rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
)

// Sparkline component
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={width} height={height} className="opacity-80">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Revenue chart component
const RevenueChart = ({ data }: { data: HourlyRevenue[] }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const chartHeight = 160

  return (
    <div className="flex items-end gap-1 h-44 px-2">
      {data.map((d, i) => {
        const barHeight = (d.revenue / maxRevenue) * chartHeight
        return (
          <div key={i} className="flex flex-col items-center flex-1 group">
            <div className="relative flex flex-col items-center justify-end" style={{ height: chartHeight }}>
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
              >
                ${d.revenue}
              </div>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-300 group-hover:from-amber-500 group-hover:to-amber-300 cursor-pointer"
                style={{ height: barHeight }}
              />
            </div>
            <span className="text-zinc-500 text-xs mt-1 hidden md:block">{d.hour}</span>
          </div>
        )
      })}
    </div>
  )
}

// Weekly chart component
const WeeklyChart = ({ data }: { data: DailyRevenue[] }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const chartHeight = 120

  return (
    <div className="flex items-end gap-2 h-36 px-2">
      {data.map((d, i) => {
        const barHeight = (d.revenue / maxRevenue) * chartHeight
        const isToday = i === new Date().getDay() - 1
        return (
          <div key={i} className="flex flex-col items-center flex-1 group">
            <div className="relative flex flex-col items-center justify-end" style={{ height: chartHeight }}>
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-700 text-amber-400 text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
              >
                ${d.revenue}
              </div>
              <div
                className={`w-full rounded-t-md transition-all duration-300 cursor-pointer ${isToday
                  ? "bg-gradient-to-t from-amber-600 to-amber-400"
                  : "bg-gradient-to-t from-zinc-700 to-zinc-600 group-hover:from-amber-700 group-hover:to-amber-500"
                  }`}
                style={{ height: barHeight }}
              />
            </div>
            <span className={`text-xs mt-1 ${isToday ? "text-amber-400 font-bold" : "text-zinc-500"}`}>{d.day}</span>
          </div>
        )
      })}
    </div>
  )
}

// Donut chart component
const DonutChart = ({ segments }: { segments: { label: string; value: number; color: string }[] }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  let cumulative = 0
  const radius = 50
  const cx = 60
  const cy = 60
  const strokeWidth = 18

  const paths = segments.map((seg) => {
    const startAngle = (cumulative / total) * 360 - 90
    const endAngle = ((cumulative + seg.value) / total) * 360 - 90
    cumulative += seg.value

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return {
      d: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: seg.color,
      label: seg.label,
      value: seg.value,
      pct: Math.round((seg.value / total) * 100),
    }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#f4f4f5" fontSize="14" fontWeight="bold">
          ${Math.round(total / 100) * 100}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#a1a1aa" fontSize="8">
          revenue
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-zinc-400 text-xs">{seg.label}</span>
            <span className="text-zinc-200 text-xs font-bold ml-auto">${seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TasteOfAmmanDashboard() {
  const [menuItems] = useState<MenuItem[]>(generateMockMenuItems)
  const [hourlyData, setHourlyData] = useState<HourlyRevenue[]>(generateHourlyData)
  const [weeklyData] = useState<DailyRevenue[]>(generateDailyData)
  const [shiftSummaries] = useState<ShiftSummary[]>(generateShiftSummaries)
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "shifts">("overview")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLive, setIsLive] = useState(true)
  const [selectedShift, setSelectedShift] = useState<"all" | "morning" | "afternoon" | "evening">("all")

  // Live tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      if (isLive) {
        setHourlyData(prev => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          updated[lastIdx] = {
            ...updated[lastIdx],
            revenue: updated[lastIdx].revenue + Math.floor(Math.random() * 12),
            orders: updated[lastIdx].orders + (Math.random() > 0.7 ? 1 : 0),
          }
          return updated
        })
        setLastUpdated(new Date())
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [isLive])

  const totalRevenue = hourlyData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = hourlyData.reduce((s, d) => s + d.orders, 0)
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalFoodCost = menuItems.reduce((s, m) => s + m.cost * m.ordersToday, 0)
  const totalItemRevenue = menuItems.reduce((s, m) => s + m.price * m.ordersToday, 0)
  const foodCostPct = totalItemRevenue > 0 ? (totalFoodCost / totalItemRevenue) * 100 : 0
  const grossMargin = 100 - foodCostPct

  const prevRevenue = totalRevenue * 0.91
  const prevOrders = totalOrders * 0.88
  const revenueChange = ((totalRevenue - prevRevenue) / prevRevenue) *