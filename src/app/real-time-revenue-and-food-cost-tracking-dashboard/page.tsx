"use client"

import { useState, useEffect, useCallback } from "react"

type Period = "daily" | "weekly" | "monthly"

interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  foodCost: number
  unitsSold: number
  trend: number[]
}

interface Alert {
  id: string
  message: string
  type: "warning" | "danger" | "info"
  timestamp: Date
}

interface HourlyData {
  hour: string
  revenue: number
  orders: number
}

const MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Mansaf", category: "Main", price: 24, foodCost: 8.5, unitsSold: 142, trend: [120, 135, 128, 142, 138, 150, 142] },
  { id: "2", name: "Shawarma Plate", category: "Main", price: 18, foodCost: 5.2, unitsSold: 218, trend: [195, 205, 212, 218, 220, 215, 218] },
  { id: "3", name: "Falafel Wrap", category: "Street Food", price: 12, foodCost: 2.8, unitsSold: 305, trend: [280, 290, 295, 305, 310, 298, 305] },
  { id: "4", name: "Hummus Plate", category: "Appetizer", price: 10, foodCost: 2.1, unitsSold: 267, trend: [240, 250, 260, 267, 265, 270, 267] },
  { id: "5", name: "Maqluba", category: "Main", price: 22, foodCost: 7.8, unitsSold: 98, trend: [85, 90, 95, 98, 100, 97, 98] },
  { id: "6", name: "Knafeh", category: "Dessert", price: 9, foodCost: 2.5, unitsSold: 189, trend: [160, 170, 180, 189, 192, 185, 189] },
  { id: "7", name: "Lamb Kofta", category: "Main", price: 20, foodCost: 7.2, unitsSold: 134, trend: [115, 120, 128, 134, 132, 138, 134] },
  { id: "8", name: "Fattoush Salad", category: "Salad", price: 11, foodCost: 3.1, unitsSold: 176, trend: [155, 160, 168, 176, 178, 172, 176] },
]

const HOURLY_DATA: HourlyData[] = [
  { hour: "11AM", revenue: 320, orders: 18 },
  { hour: "12PM", revenue: 890, orders: 52 },
  { hour: "1PM", revenue: 1240, orders: 71 },
  { hour: "2PM", revenue: 760, orders: 44 },
  { hour: "3PM", revenue: 430, orders: 25 },
  { hour: "4PM", revenue: 380, orders: 22 },
  { hour: "5PM", revenue: 620, orders: 36 },
  { hour: "6PM", revenue: 1480, orders: 85 },
  { hour: "7PM", revenue: 1820, orders: 104 },
  { hour: "8PM", revenue: 1650, orders: 94 },
  { hour: "9PM", revenue: 1290, orders: 74 },
  { hour: "10PM", revenue: 840, orders: 48 },
]

const WEEKLY_REVENUE = [8420, 9150, 8780, 10240, 11320, 12450, 11890]
const WEEKLY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const MONTHLY_REVENUE = [68400, 72100, 69800, 75200, 78900, 82400, 79100, 85600, 88200, 91400, 87600, 94200]
const MONTHLY_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function TasteOfAmmanDashboard() {
  const [period, setPeriod] = useState<Period>("daily")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [costThreshold, setCostThreshold] = useState(35)
  const [liveRevenue, setLiveRevenue] = useState(12340)
  const [liveOrders, setLiveOrders] = useState(673)
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "costs" | "alerts">("overview")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<"revenue" | "margin" | "units">("revenue")
  const [thresholdInput, setThresholdInput] = useState("35")
  const [showThresholdModal, setShowThresholdModal] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [pulseActive, setPulseActive] = useState(false)

  const categories = ["All", ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))]

  const filteredItems = MENU_ITEMS
    .filter(item => selectedCategory === "All" || item.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "revenue") return (b.price * b.unitsSold) - (a.price * a.unitsSold)
      if (sortBy === "margin") return ((b.price - b.foodCost) / b.price) - ((a.price - a.foodCost) / a.price)
      return b.unitsSold - a.unitsSold
    })

  const totalRevenue = period === "daily" ? liveRevenue :
    period === "weekly" ? WEEKLY_REVENUE.reduce((a, b) => a + b, 0) :
    MONTHLY_REVENUE.reduce((a, b) => a + b, 0)

  const totalFoodCost = MENU_ITEMS.reduce((sum, item) => sum + item.foodCost * item.unitsSold, 0)
  const grossMargin = ((totalRevenue - totalFoodCost * (period === "daily" ? 1 : period === "weekly" ? 7 : 30)) / totalRevenue * 100)
  const avgFoodCostPct = (MENU_ITEMS.reduce((sum, item) => sum + (item.foodCost / item.price), 0) / MENU_ITEMS.length * 100)

  const generateAlerts = useCallback(() => {
    const newAlerts: Alert[] = []
    MENU_ITEMS.forEach(item => {
      const costPct = (item.foodCost / item.price) * 100
      if (costPct > costThreshold) {
        newAlerts.push({
          id: `cost-${item.id}`,
          message: `${item.name} food cost at ${costPct.toFixed(1)}% — exceeds ${costThreshold}% threshold`,
          type: costPct > costThreshold + 5 ? "danger" : "warning",
          timestamp: new Date()
        })
      }
    })
    if (liveOrders > 650) {
      newAlerts.push({
        id: "high-volume",
        message: "High order volume detected — consider staffing surge protocols",
        type: "info",
        timestamp: new Date()
      })
    }
    setAlerts(newAlerts)
  }, [costThreshold, liveOrders])

  useEffect(() => {
    generateAlerts()
  }, [generateAlerts])

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRevenue(prev => prev + Math.floor(Math.random() * 45) + 5)
      setLiveOrders(prev => prev + (Math.random() > 0.6 ? 1 : 0))
      setLastUpdate(new Date())
      setPulseActive(true)
      setTimeout(() => setPulseActive(false), 600)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const maxHourlyRevenue = Math.max(...HOURLY_DATA.map(d => d.revenue))
  const maxWeeklyRevenue = Math.max(...WEEKLY_REVENUE)
  const maxMonthlyRevenue = Math.max(...MONTHLY_REVENUE)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val)

  const getMarginColor = (margin: number) => {
    if (margin >= 70) return "text-emerald-400"
    if (margin >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getCostBadgeColor = (costPct: number) => {
    if (costPct <= costThreshold - 5) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
    if (costPct <= costThreshold) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border border-red-500/30"
  }

  const handleThresholdSave = () => {
    const val = parseFloat(thresholdInput)
    if (!isNaN(val) && val > 0 && val < 100) {
      setCostThreshold(val)
      setShowThresholdModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-900/30">
              TA
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Taste of Amman</h1>
              <p className="text-xs text-zinc-400">Revenue & Cost Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs transition-all ${pulseActive ? "border-emerald-500/50" : ""}`}>
              <span className={`w-2 h-2 rounded-full bg-emerald-500 ${pulseActive ? "animate-ping" : "animate-pulse"}`} />
              <span className="text-zinc-300">Live</span>
              <span className="text-zinc-500">{lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
            <button
              onClick={() => setShowThresholdModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-500/20 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Threshold: {costThreshold}%
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.filter(a => a.type === "danger").length > 0 && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-red-400">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{alerts.filter(a => a.type === "danger").length} critical cost alert{alerts.filter(a => a.type === "danger").length > 1 ? "s" : ""} — food costs exceeding threshold</span>
            <button onClick={() => setActiveTab("alerts")} className="ml-auto text-xs underline underline-offset-2 hover:text-red-300">View All</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: period === "daily" ? "Today's Revenue" : period === "weekly" ? "Weekly Revenue" : "Monthly Revenue",
              value: formatCurrency(totalRevenue),
              sub: `+8.4% vs last ${period === "daily" ? "day" : period}`,
              icon: "💰",
              color: "from-emerald-500/20 to-emerald-600/10",
              border: "border-emerald-500/20",
              subColor: "text-emerald-400",
              live: period === "daily"
            },
            {
              label: "Total Orders",
              value: liveOrders.toLocaleString(),
              sub: "Today",
              icon: "🍽️",
              color: "from-blue-500/20 to-blue-600/10",
              border: "border-blue-500/20",
              subColor: "text-blue-400",
              live: true
            },
            {
              label: "Gross Margin",
              value: `${Math.max(0, grossMargin).toFixed(1)}%`,
              sub: grossMargin >= 65 ? "On target" : "Below target",
              icon: "📊",