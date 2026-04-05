"use client"

import { useState, useEffect, useCallback } from "react"

type Platform = "doordash" | "ubereats" | "grubhub" | "direct"
type OrderStatus = "incoming" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled"

interface Driver {
  name: string
  eta: number
  location: string
  avatar: string
}

interface OrderItem {
  name: string
  qty: number
  price: number
}

interface Order {
  id: string
  platform: Platform
  customerName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  placedAt: Date
  estimatedDelivery: number
  address: string
  driver?: Driver
  specialInstructions?: string
}

const PLATFORM_CONFIG: Record<Platform, { name: string; color: string; bg: string; icon: string }> = {
  doordash: { name: "DoorDash", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: "🔴" },
  ubereats: { name: "UberEats", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: "🟢" },
  grubhub: { name: "Grubhub", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: "🟠" },
  direct: { name: "Direct Order", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: "⭐" },
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: string }> = {
  incoming: { label: "Incoming", color: "text-blue-400", bg: "bg-blue-500/20", icon: "📥" },
  preparing: { label: "Preparing", color: "text-amber-400", bg: "bg-amber-500/20", icon: "👨‍🍳" },
  ready: { label: "Ready", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: "✅" },
  picked_up: { label: "Picked Up", color: "text-purple-400", bg: "bg-purple-500/20", icon: "🛵" },
  delivered: { label: "Delivered", color: "text-zinc-400", bg: "bg-zinc-500/20", icon: "🏠" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/20", icon: "❌" },
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: "TOA-1042",
    platform: "doordash",
    customerName: "Sarah M.",
    items: [
      { name: "Mansaf (Lamb)", qty: 1, price: 22 },
      { name: "Hummus", qty: 2, price: 8 },
      { name: "Pita Bread", qty: 3, price: 6 },
    ],
    total: 36,
    status: "preparing",
    placedAt: new Date(Date.now() - 12 * 60000),
    estimatedDelivery: 18,
    address: "420 Cedar Ave, Downtown",
    driver: { name: "Carlos R.", eta: 8, location: "0.3 mi away", avatar: "🧑" },
    specialInstructions: "Extra garlic sauce please",
  },
  {
    id: "TOA-1043",
    platform: "ubereats",
    customerName: "James K.",
    items: [
      { name: "Shawarma Plate", qty: 2, price: 18 },
      { name: "Falafel Wrap", qty: 1, price: 12 },
    ],
    total: 48,
    status: "incoming",
    placedAt: new Date(Date.now() - 2 * 60000),
    estimatedDelivery: 35,
    address: "88 Main St, Suite 4",
  },
  {
    id: "TOA-1044",
    platform: "grubhub",
    customerName: "Fatima A.",
    items: [
      { name: "Kebab Platter", qty: 1, price: 24 },
      { name: "Lentil Soup", qty: 2, price: 10 },
      { name: "Baklava", qty: 4, price: 16 },
    ],
    total: 50,
    status: "ready",
    placedAt: new Date(Date.now() - 28 * 60000),
    estimatedDelivery: 5,
    address: "1201 Broad Street",
    driver: { name: "Alex T.", eta: 3, location: "Arriving soon", avatar: "👦" },
  },
  {
    id: "TOA-1045",
    platform: "direct",
    customerName: "Omar H.",
    items: [
      { name: "Mansaf (Chicken)", qty: 1, price: 18 },
      { name: "Tabouleh", qty: 1, price: 9 },
    ],
    total: 27,
    status: "picked_up",
    placedAt: new Date(Date.now() - 45 * 60000),
    estimatedDelivery: 10,
    address: "567 Park Blvd, Apt 2B",
    driver: { name: "Maria L.", eta: 7, location: "1.2 mi away", avatar: "👩" },
  },
  {
    id: "TOA-1041",
    platform: "doordash",
    customerName: "Rachel P.",
    items: [{ name: "Falafel Plate", qty: 2, price: 14 }],
    total: 28,
    status: "delivered",
    placedAt: new Date(Date.now() - 75 * 60000),
    estimatedDelivery: 0,
    address: "99 Oak Lane",
  },
  {
    id: "TOA-1046",
    platform: "ubereats",
    customerName: "David W.",
    items: [
      { name: "Shawarma Wrap", qty: 3, price: 12 },
      { name: "Hummus & Pita", qty: 1, price: 10 },
    ],
    total: 46,
    status: "incoming",
    placedAt: new Date(Date.now() - 1 * 60000),
    estimatedDelivery: 40,
    address: "333 Elm Court",
    specialInstructions: "No onions on shawarma",
  },
]

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return "Just now"
  if (mins === 1) return "1 min ago"
  return `${mins} mins ago`
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg = PLATFORM_CONFIG[platform]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      <span>{cfg.icon}</span>
      {cfg.name}
    </span>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string | number; sub?: string; accent: string }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-500 text-sm font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
          {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function DriverTracker({ driver }: { driver: Driver }) {
  return (
    <div className="mt-3 bg-zinc-800/60 rounded-lg p-3 border border-zinc-700">
      <div className="flex items-center gap-2">
        <span className="text-xl">{driver.avatar}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100">{driver.name}</p>
          <p className="text-xs text-zinc-400">{driver.location}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-amber-400">{driver.eta} min</p>
          <p className="text-xs text-zinc-500">ETA</p>
        </div>
      </div>
      <div className="mt-2">
        <div className="w-full bg-zinc-700 rounded-full h-1.5">
          <div
            className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(10, 100 - driver.eta * 5)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onStatusChange, isSelected, onClick }: {
  order: Order
  onStatusChange: (id: string, status: OrderStatus) => void
  isSelected: boolean
  onClick: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    incoming: "preparing",
    preparing: "ready",
    ready: "picked_up",
    picked_up: "delivered",
  }

  const next = nextStatus[order.status]

  return (
    <div
      className={`bg-zinc-900 border rounded-xl transition-all duration-200 cursor-pointer ${
        isSelected ? "border-amber-500/50 shadow-lg shadow-amber-500/5" : "border-zinc-800 hover:border-zinc-700"
      } ${order.status === "incoming" ? "ring-1 ring-blue-500/30" : ""}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-amber-400 font-bold text-sm font-mono">{order.id}</span>
              <PlatformBadge platform={order.platform} />
            </div>
            <p className="text-zinc-100 font-semibold mt-1">{order.customerName}</p>
            <p className="text-zinc-500 text-xs mt-0.5 truncate">📍 {order.address}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold text-lg">${order.total}</span>
            <span className="text-zinc-500 text-xs">{timeAgo(order.placedAt)}</span>
          </div>
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <span className="text-xs text-zinc-400 bg-zinc-800 rounded-full px-2 py-0.5">
              ⏱ {order.estimatedDelivery}m
            </span>
          )}
        </div>

        {order.driver && order.status !== "delivered" && <DriverTracker driver={order.driver} />}

        <button
          className="mt-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
          onClick={e => { e.stopPropagation(); setExpanded(!expanded) }}
        >
          {expanded ? "▲ Hide" : "▼ Show"} items ({order.items.length})
        </button>

        {expanded && (
          <div className="mt-2 space-y-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{item.qty}× {item.name}</span>
                <span className="text-zinc-400">${item.price}</span>
              </div>
            ))}
            {order.specialInstructions && (
              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-300">📝 {order.specialInstructions}</p>
              </div>
            )}
          </div>
        )}

        {next && (
          <button
            className="mt-3 w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-all duration-200 hover:shadow-md hover:shadow-amber-500/20 active:scale-95"
            onClick={e => { e.stopPropagation(); onStatusChange(order.id, next) }}
          >
            Mark as {STATUS_CONFIG[next].label} {STATUS_CONFIG[next].icon}
          </button>
        )}
      </div>
    </div>
  )
}

export default function TasteOfAmmanDeliveryHub() {
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS)
  const [filter, setFilter] = useState<"all" | OrderStatus>("all")
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false)
  const [syncPulse, setSyncPulse] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const pulse = setInterval(() => {
      setSyncPulse(true)
      setTimeout(() => setSyncPulse(false), 500)
    }, 5000)
    return () => clearInterval(pulse)
  }, [])

  const handleStatusChange = useCallback((id: string, status: OrderStatus) => {
    setOrders(prev