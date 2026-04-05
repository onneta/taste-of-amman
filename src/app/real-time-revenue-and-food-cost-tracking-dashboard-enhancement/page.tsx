"use client"

import { useState, useEffect, useCallback } from "react"

type Period = "daily" | "weekly" | "monthly"
type Tab = "overview" | "profitability" | "trends" | "alerts" | "reports"

interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  foodCost: number
  unitsSold: number
  trend: "up" | "down" | "stable"
}

interface DayData {
  label: string
  revenue: number
  foodCost: number
  orders: number
}

interface Alert {
  id: string
  type: "warning" | "danger" | "info" | "success"
  message: string
  time: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Mansaf (Traditional)", category: "Mains", price: 24, foodCost: 8.4, unitsSold: 142, trend: "up" },
  { id: "2", name: "Shawarma Plate", category: "Mains", price: 18, foodCost: 5.4, unitsSold: 198, trend: "up" },
  { id: "3", name: "Falafel Wrap", category: "Wraps", price: 12, foodCost: 2.4, unitsSold: 234, trend: "stable" },
  { id: "4", name: "Hummus & Pita", category: "Starters", price: 8, foodCost: 1.6, unitsSold: 312, trend: "up" },
  { id: "5", name: "Lamb Kofta", category: "Mains", price: 22, foodCost: 9.9, unitsSold: 89, trend: "down" },
  { id: "6", name: "Musakhan Roll", category: "Wraps", price: 15, foodCost: 5.25, unitsSold: 76, trend: "stable" },
  { id: "7", name: "Fattoush Salad", category: "Salads", price: 10, foodCost: 2.0, unitsSold: 167, trend: "up" },
  { id: "8", name: "Knafeh", category: "Desserts", price: 9, foodCost: 2.7, unitsSold: 203, trend: "up" },
  { id: "9", name: "Maqluba", category: "Mains", price: 20, foodCost: 8.0, unitsSold: 54, trend: "down" },
  { id: "10", name: "Mint Lemonade", category: "Drinks", price: 6, foodCost: 0.9, unitsSold: 445, trend: "up" },
]

const DAILY_DATA: DayData[] = [
  { label: "Mon", revenue: 2840, foodCost: 909, orders: 142 },
  { label: "Tue", revenue: 3120, foodCost: 1029, orders: 156 },
  { label: "Wed", revenue: 2960, foodCost: 976, orders: 148 },
  { label: "Thu", revenue: 3480, foodCost: 1113, orders: 174 },
  { label: "Fri", revenue: 4920, foodCost: 1575, orders: 246 },
  { label: "Sat", revenue: 5340, foodCost: 1763, orders: 267 },
  { label: "Sun", revenue: 4120, foodCost: 1319, orders: 206 },
]

const WEEKLY_DATA: DayData[] = [
  { label: "Wk 1", revenue: 24800, foodCost: 7936, orders: 1240 },
  { label: "Wk 2", revenue: 26300, foodCost: 8416, orders: 1315 },
  { label: "Wk 3", revenue: 25100, foodCost: 8032, orders: 1255 },
  { label: "Wk 4", revenue: 28400, foodCost: 9088, orders: 1420 },
]

const MONTHLY_DATA: DayData[] = [
  { label: "Jan", revenue: 89200, foodCost: 28544, orders: 4460 },
  { label: "Feb", revenue: 82100, foodCost: 26272, orders: 4105 },
  { label: "Mar", revenue: 95400, foodCost: 30528, orders: 4770 },
  { label: "Apr", revenue: 98700, foodCost: 31584, orders: 4935 },
  { label: "May", revenue: 104200, foodCost: 33344, orders: 5210 },
  { label: "Jun", revenue: 112300, foodCost: 35936, orders: 5615 },
]

const ALERTS: Alert[] = [
  { id: "1", type: "danger", message: "Lamb Kofta food cost exceeded 45% threshold (45.0%)", time: "2 hours ago" },
  { id: "2", type: "warning", message: "Maqluba food cost at 40% — approaching 42% limit", time: "4 hours ago" },
  { id: "3", type: "success", message: "Mint Lemonade achieved best margin this week (85%)", time: "6 hours ago" },
  { id: "4", type: "info", message: "Weekend revenue up 18.4% vs last week average", time: "1 day ago" },
  { id: "5", type: "warning", message: "Musakhan Roll sales dropped 12% vs last week", time: "1 day ago" },
  { id: "6", type: "success", message: "Overall food cost % at 32% — within target range", time: "2 days ago" },
]

export default function RevenueTrackingDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [period, setPeriod] = useState<Period>("daily")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [sortField, setSortField] = useState<"margin" | "revenue" | "units">("revenue")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [liveRevenue, setLiveRevenue] = useState(26780)
  const [liveOrders, setLiveOrders] = useState(1339)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
  const [costThreshold, setCostThreshold] = useState(38)
  const [animatedValues, setAnimatedValues] = useState({ revenue: 0, orders: 0, foodCostPct: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRevenue(prev => prev + Math.floor(Math.random() * 45 - 10))
      setLiveOrders(prev => prev + (Math.random() > 0.7 ? 1 : 0))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({ revenue: liveRevenue, orders: liveOrders, foodCostPct: 32.1 })
    }, 300)
    return () => clearTimeout(timer)
  }, [liveRevenue, liveOrders])

  const chartData = period === "daily" ? DAILY_DATA : period === "weekly" ? WEEKLY_DATA : MONTHLY_DATA

  const maxRevenue = Math.max(...chartData.map(d => d.revenue))

  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))]

  const filteredItems = MENU_ITEMS
    .filter(item => selectedCategory === "All" || item.category === selectedCategory)
    .map(item => ({
      ...item,
      margin: ((item.price - item.foodCost) / item.price) * 100,
      totalRevenue: item.price * item.unitsSold,
      totalCost: item.foodCost * item.unitsSold,
      profit: (item.price - item.foodCost) * item.unitsSold,
    }))
    .sort((a, b) => {
      const fieldMap = { margin: "margin", revenue: "totalRevenue", units: "unitsSold" }
      const field = fieldMap[sortField] as keyof typeof a
      return sortDir === "desc" ? (b[field] as number) - (a[field] as number) : (a[field] as number) - (b[field] as number)
    })

  const totalRevenue = MENU_ITEMS.reduce((s, i) => s + i.price * i.unitsSold, 0)
  const totalCost = MENU_ITEMS.reduce((s, i) => s + i.foodCost * i.unitsSold, 0)
  const overallMargin = ((totalRevenue - totalCost) / totalRevenue) * 100

  const alertCounts = {
    danger: ALERTS.filter(a => a.type === "danger").length,
    warning: ALERTS.filter(a => a.type === "warning").length,
  }

  const handleExport = () => {
    if (exportFormat === "csv") {
      const headers = ["Item", "Category", "Price", "Food Cost", "Food Cost %", "Units Sold", "Total Revenue", "Profit"]
      const rows = filteredItems.map(item => [
        item.name, item.category, `$${item.price}`, `$${item.foodCost}`,
        `${((item.foodCost / item.price) * 100).toFixed(1)}%`,
        item.unitsSold, `$${item.totalRevenue}`, `$${item.profit.toFixed(0)}`
      ])
      const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `taste-of-amman-report-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
    setShowExportModal(false)
  }

  const formatCurrency = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`

  const getAlertColor = (type: Alert["type"]) => {
    const map = {
      danger: "border-red-500/40 bg-red-500/10 text-red-300",
      warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
      info: "border-blue-500/40 bg-blue-500/10 text-blue-300",
      success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    }
    return map[type]
  }

  const getAlertIcon = (type: Alert["type"]) => {
    const icons = {
      danger: "🚨",
      warning: "⚠️",
      info: "ℹ️",
      success: "✅",
    }
    return icons[type]
  }

  const getCostColor = (pct: number) => {
    if (pct >= costThreshold) return "text-red-400"
    if (pct >= costThreshold - 5) return "text-amber-400"
    return "text-emerald-400"
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "profitability", label: "Menu Analysis", icon: "🍽️" },
    { id: "trends", label: "Trends", icon: "📈" },
    { id: "alerts", label: "Alerts", icon: "🔔" },
    { id: "reports", label: "Reports", icon: "📄" },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              🫙
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100 leading-tight">Taste of Amman</h1>
              <p className="text-xs text-zinc-400">Revenue & Cost Intelligence Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-emerald-400 font-medium">Live • 11:00 AM – 11:00 PM</span>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-lg text-sm font-semibold transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Today's Revenue",
              value: `$${liveRevenue.toLocaleString()}`,
              sub: "+12.4% vs yesterday",
              subColor: "text-emerald-400",
              icon: "💰",
              iconBg: "from-emerald-500/20 to-emerald-600/10",
              border: "border-emerald-500/20",
            },
            {
              label: "Orders Today",
              value: liveOrders.toLocaleString(),
              sub: "Avg $20.0 / order",
              subColor: "text-zinc-400",
              icon: "🧾",
              iconBg: "from-blue-500/20 to-blue-600/10",
              border: "border-blue-500/20",
            },
            {
              label: "Food Cost %",
              value: "32.1%",
              sub: `Target: <${costThreshold}%`,
              subColor: "text-emerald-400",
              icon: "🧅",
              iconBg: "from-amber-500/20 to-amber-600/10",
              border: "border-amber-500/20",
            },
            {
              label: "Gross Margin",
              value: `${overallMargin.toFixed(1)}%`,
              sub: "+2.1% vs last month",
              subColor: