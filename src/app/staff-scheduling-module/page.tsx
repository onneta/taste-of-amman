"use client"

import { useState, useEffect } from "react"

type Role = "Server" | "Cook" | "Cashier" | "Host" | "Delivery"
type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

interface StaffMember {
  id: number
  name: string
  role: Role
  hourlyRate: number
  phone: string
  email: string
  availability: Day[]
  color: string
}

interface Shift {
  id: string
  staffId: number
  day: Day
  startTime: string
  endTime: string
  role: Role
}

interface DayRevenue {
  day: Day
  projected: number
}

const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const ROLES: Role[] = ["Server", "Cook", "Cashier", "Host", "Delivery"]
const ROLE_COLORS: Record<Role, string> = {
  Server: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Cook: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Cashier: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Host: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Delivery: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}
const ROLE_ICONS: Record<Role, string> = {
  Server: "🍽️",
  Cook: "👨‍🍳",
  Cashier: "💰",
  Host: "👋",
  Delivery: "🛵",
}
const STAFF_COLORS = [
  "bg-amber-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-purple-500",
  "bg-yellow-500",
]

const INITIAL_STAFF: StaffMember[] = [
  { id: 1, name: "Ahmad Khalil", role: "Cook", hourlyRate: 18, phone: "+1-555-0101", email: "ahmad@tasteofamman.com", availability: ["Mon","Tue","Wed","Thu","Fri"], color: "bg-amber-500" },
  { id: 2, name: "Fatima Nasser", role: "Server", hourlyRate: 14, phone: "+1-555-0102", email: "fatima@tasteofamman.com", availability: ["Mon","Wed","Fri","Sat","Sun"], color: "bg-orange-500" },
  { id: 3, name: "Omar Saleh", role: "Cashier", hourlyRate: 15, phone: "+1-555-0103", email: "omar@tasteofamman.com", availability: ["Tue","Thu","Sat","Sun"], color: "bg-emerald-500" },
  { id: 4, name: "Layla Hassan", role: "Host", hourlyRate: 13, phone: "+1-555-0104", email: "layla@tasteofamman.com", availability: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], color: "bg-indigo-500" },
  { id: 5, name: "Yousef Amin", role: "Cook", hourlyRate: 17, phone: "+1-555-0105", email: "yousef@tasteofamman.com", availability: ["Wed","Thu","Fri","Sat","Sun"], color: "bg-rose-500" },
  { id: 6, name: "Nadia Ibrahim", role: "Server", hourlyRate: 14, phone: "+1-555-0106", email: "nadia@tasteofamman.com", availability: ["Mon","Tue","Sat","Sun"], color: "bg-cyan-500" },
  { id: 7, name: "Kareem Mansour", role: "Delivery", hourlyRate: 13, phone: "+1-555-0107", email: "kareem@tasteofamman.com", availability: ["Thu","Fri","Sat","Sun"], color: "bg-purple-500" },
]

const INITIAL_SHIFTS: Shift[] = [
  { id: "s1", staffId: 1, day: "Mon", startTime: "10:00", endTime: "18:00", role: "Cook" },
  { id: "s2", staffId: 2, day: "Mon", startTime: "11:00", endTime: "19:00", role: "Server" },
  { id: "s3", staffId: 4, day: "Mon", startTime: "11:00", endTime: "20:00", role: "Host" },
  { id: "s4", staffId: 1, day: "Tue", startTime: "10:00", endTime: "18:00", role: "Cook" },
  { id: "s5", staffId: 3, day: "Tue", startTime: "11:00", endTime: "19:00", role: "Cashier" },
  { id: "s6", staffId: 5, day: "Fri", startTime: "12:00", endTime: "22:00", role: "Cook" },
  { id: "s7", staffId: 2, day: "Fri", startTime: "12:00", endTime: "21:00", role: "Server" },
  { id: "s8", staffId: 7, day: "Sat", startTime: "14:00", endTime: "22:00", role: "Delivery" },
]

const INITIAL_REVENUES: DayRevenue[] = [
  { day: "Mon", projected: 1200 },
  { day: "Tue", projected: 1100 },
  { day: "Wed", projected: 1300 },
  { day: "Thu", projected: 1500 },
  { day: "Fri", projected: 2800 },
  { day: "Sat", projected: 3200 },
  { day: "Sun", projected: 2600 },
]

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return (eh * 60 + em - sh * 60 - sm) / 60
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase()
}

export default function StaffSchedulingModule() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF)
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS)
  const [revenues, setRevenues] = useState<DayRevenue[]>(INITIAL_REVENUES)
  const [activeTab, setActiveTab] = useState<"schedule" | "staff" | "availability" | "reminders">("schedule")
  const [selectedDay, setSelectedDay] = useState<Day | null>(null)
  const [showAddShift, setShowAddShift] = useState(false)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [editRevenue, setEditRevenue] = useState<Day | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [remindersSent, setRemindersSent] = useState<Set<string>>(new Set())

  const [newShift, setNewShift] = useState<Partial<Shift>>({
    day: "Mon",
    startTime: "10:00",
    endTime: "18:00",
    role: "Server",
  })
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    role: "Server",
    hourlyRate: 14,
    availability: [],
  })

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const totalLaborCost = shifts.reduce((acc, shift) => {
    const member = staff.find(s => s.id === shift.staffId)
    if (!member) return acc
    return acc + calcHours(shift.startTime, shift.endTime) * member.hourlyRate
  }, 0)

  const totalProjectedRevenue = revenues.reduce((acc, r) => acc + r.projected, 0)
  const laborPercent = totalProjectedRevenue > 0 ? (totalLaborCost / totalProjectedRevenue) * 100 : 0

  const getDayLaborCost = (day: Day) => {
    return shifts.filter(s => s.day === day).reduce((acc, shift) => {
      const member = staff.find(s => s.id === shift.staffId)
      if (!member) return acc
      return acc + calcHours(shift.startTime, shift.endTime) * member.hourlyRate
    }, 0)
  }

  const getDayRevenue = (day: Day) => revenues.find(r => r.day === day)?.projected || 0

  const getDayLaborPercent = (day: Day) => {
    const rev = getDayRevenue(day)
    if (rev === 0) return 0
    return (getDayLaborCost(day) / rev) * 100
  }

  const addShift = () => {
    if (!newShift.staffId || !newShift.day || !newShift.startTime || !newShift.endTime) return
    const id = `s${Date.now()}`
    setShifts(prev => [...prev, { ...newShift, id } as Shift])
    setShowAddShift(false)
    setNewShift({ day: "Mon", startTime: "10:00", endTime: "18:00", role: "Server" })
    showNotification("✅ Shift added successfully!")
  }

  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id))
    showNotification("🗑️ Shift removed")
  }

  const addStaff = () => {
    if (!newStaff.name || !newStaff.role || !newStaff.phone || !newStaff.email) return
    const id = Math.max(...staff.map(s => s.id)) + 1
    const color = STAFF_COLORS[id % STAFF_COLORS.length]
    setStaff(prev => [...prev, { ...newStaff, id, color, availability: newStaff.availability || [] } as StaffMember])
    setShowAddStaff(false)
    setNewStaff({ role: "Server", hourlyRate: 14, availability: [] })
    showNotification("✅ Staff member added!")
  }

  const toggleAvailability = (staffId: number, day: Day) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== staffId) return s
      const avail = s.availability.includes(day)
        ? s.availability.filter(d => d !== day)
        : [...s.availability, day]
      return { ...s, availability: avail }
    }))
  }

  const sendReminder = (type: "sms" | "email", staffId: number) => {
    const key = `${type}-${staffId}`
    setRemindersSent(prev => new Set([...prev, key]))
    const member = staff.find(s => s.id === staffId)
    showNotification(`📨 ${type.toUpperCase()} reminder sent to ${member?.name}!`)
  }

  const sendAllReminders = () => {
    const keys = staff.flatMap(s => [`sms-${s.id}`, `email-${s.id}`])
    setRemindersSent(new Set(keys))
    showNotification("📨 All shift reminders sent to staff!")
  }

  const getStaffShiftsForWeek = (staffId: number) => shifts.filter(s => s.staffId === staffId)

  const getStaffWeeklyHours = (staffId: number) => {
    return getStaffShiftsForWeek(staffId).reduce((acc, shift) => acc + calcHours(shift.startTime, shift.endTime), 0)
  }

  const getStaffWeeklyPay = (staffId: number) => {
    const member = staff.find(s => s.id === staffId)
    if (!member) return 0
    return getStaffWeeklyHours(staffId) * member.hourlyRate
  }

  const laborColor = laborPercent > 35 ? "text-rose-400" : laborPercent > 28 ? "text-amber-400" : "text-emerald-400"
  const laborBarColor = laborPercent > 35 ? "bg-rose-500" : laborPercent > 28 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-800 border border-amber-500/30 text-amber-300 px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-pulse">
          {notification}
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-900 via-amber-950/20 to-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg">
              🧆
            </div>
            <div>
              <div className="text-amber-400 text-sm font-semibold tracking-widest uppercase">Taste of Amman</div>
              <h1 className="text-3xl font-bold text-white">Staff Scheduling</h1>
            </div>
          </div>
          <p className="text-zinc-400 text-sm ml-18 mt-1">Weekly schedule management · Labor cost tracking · Shift reminders</p>

          {/* KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
              <div className="text-zinc-400 text-xs mb-1">Weekly Labor Cost</div>
              <div className="text-2xl font-bold text-white">${totalLaborCost.toFixed(0)}</div>
              <div className="text-zinc-500 text-xs mt-1">{shifts.length} shifts scheduled</div>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
              <div className="text-zinc-400 text-xs mb-1">Projected Revenue</div>
              <div className="text-2xl font-bold text-white">${totalProjectedRevenue.toLocaleString()}</div>
              <div className="text-zinc-500 text-xs mt-1">7-day forecast</div>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
              <div className="text-zinc-400 text-xs mb-1">