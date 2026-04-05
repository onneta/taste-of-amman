"use client"

import { useState, useEffect } from "react"

type Role = "Manager" | "Head Chef" | "Line Cook" | "Prep Cook" | "Server" | "Host" | "Busser" | "Delivery Driver" | "Dishwasher" | "Cashier"

type ShiftTime = "11:00 AM - 3:00 PM" | "3:00 PM - 7:00 PM" | "7:00 PM - 11:00 PM" | "11:00 AM - 7:00 PM" | "3:00 PM - 11:00 PM" | "11:00 AM - 11:00 PM"

type AvailabilityStatus = "Available" | "Unavailable" | "Requested Off"

interface StaffMember {
  id: number
  name: string
  role: Role
  hourlyRate: number
  availability: Record<string, AvailabilityStatus>
  phone: string
  email: string
  color: string
}

interface Shift {
  id: number
  staffId: number
  day: string
  time: ShiftTime
  notes: string
}

interface ChecklistItem {
  id: number
  task: string
  category: "Opening" | "Closing" | "Midday"
  assignedRole: Role
  completed: boolean
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const SHIFT_TIMES: ShiftTime[] = [
  "11:00 AM - 3:00 PM",
  "3:00 PM - 7:00 PM",
  "7:00 PM - 11:00 PM",
  "11:00 AM - 7:00 PM",
  "3:00 PM - 11:00 PM",
  "11:00 AM - 11:00 PM"
]

const SHIFT_HOURS: Record<ShiftTime, number> = {
  "11:00 AM - 3:00 PM": 4,
  "3:00 PM - 7:00 PM": 4,
  "7:00 PM - 11:00 PM": 4,
  "11:00 AM - 7:00 PM": 8,
  "3:00 PM - 11:00 PM": 8,
  "11:00 AM - 11:00 PM": 12
}

const ROLE_COLORS: Record<Role, string> = {
  "Manager": "bg-purple-600",
  "Head Chef": "bg-red-600",
  "Line Cook": "bg-orange-600",
  "Prep Cook": "bg-yellow-600",
  "Server": "bg-blue-600",
  "Host": "bg-cyan-600",
  "Busser": "bg-green-600",
  "Delivery Driver": "bg-pink-600",
  "Dishwasher": "bg-gray-600",
  "Cashier": "bg-indigo-600"
}

const initialStaff: StaffMember[] = [
  { id: 1, name: "Ahmad Khalil", role: "Manager", hourlyRate: 22, phone: "555-0101", email: "ahmad@tasteofamman.com", color: "purple",
    availability: { Monday: "Available", Tuesday: "Available", Wednesday: "Available", Thursday: "Available", Friday: "Available", Saturday: "Available", Sunday: "Unavailable" } },
  { id: 2, name: "Fatima Nassar", role: "Head Chef", hourlyRate: 20, phone: "555-0102", email: "fatima@tasteofamman.com", color: "red",
    availability: { Monday: "Available", Tuesday: "Available", Wednesday: "Requested Off", Thursday: "Available", Friday: "Available", Saturday: "Available", Sunday: "Available" } },
  { id: 3, name: "Omar Haddad", role: "Line Cook", hourlyRate: 16, phone: "555-0103", email: "omar@tasteofamman.com", color: "orange",
    availability: { Monday: "Available", Tuesday: "Unavailable", Wednesday: "Available", Thursday: "Available", Friday: "Available", Saturday: "Available", Sunday: "Available" } },
  { id: 4, name: "Lina Yousef", role: "Server", hourlyRate: 12, phone: "555-0104", email: "lina@tasteofamman.com", color: "blue",
    availability: { Monday: "Available", Tuesday: "Available", Wednesday: "Available", Thursday: "Requested Off", Friday: "Available", Saturday: "Available", Sunday: "Available" } },
  { id: 5, name: "Kareem Abuali", role: "Server", hourlyRate: 12, phone: "555-0105", email: "kareem@tasteofamman.com", color: "blue",
    availability: { Monday: "Unavailable", Tuesday: "Available", Wednesday: "Available", Thursday: "Available", Friday: "Available", Saturday: "Available", Sunday: "Available" } },
  { id: 6, name: "Nour Barakat", role: "Host", hourlyRate: 13, phone: "555-0106", email: "nour@tasteofamman.com", color: "cyan",
    availability: { Monday: "Available", Tuesday: "Available", Wednesday: "Available", Thursday: "Available", Friday: "Available", Saturday: "Available", Sunday: "Requested Off" } },
  { id: 7, name: "Samir Jaber", role: "Prep Cook", hourlyRate: 14, phone: "555-0107", email: "samir@tasteofamman.com", color: "yellow",
    availability: { Monday: "Available", Tuesday: "Available", Wednesday: "Available", Thursday: "Available", Friday: "Available", Saturday: "Unavailable", Sunday: "Unavailable" } },
  { id: 8, name: "Rana Hasan", role: "Delivery Driver", hourlyRate: 13, phone: "555-0108", email: "rana@tasteofamman.com", color: "pink",
    availability: { Monday: "Unavailable", Tuesday: "Available", Wednesday: "Available", Thursday: "Available", Friday: "Available", Saturday: "Available", Sunday: "Available" } },
  { id: 9, name: "Ziad Mansour", role: "Dishwasher", hourlyRate: 11, phone: "555-0109", email: "ziad@tasteofamman.com", color: "gray",
    availability: { Monday: "Available", Tuesday: "Available", Wednesday: "Available", Thursday: "Available", Friday: "Available", Saturday: "Available", Sunday: "Available" } },
  { id: 10, name: "Hala Osman", role: "Cashier", hourlyRate: 13, phone: "555-0110", email: "hala@tasteofamman.com", color: "indigo",
    availability: { Monday: "Available", Tuesday: "Available", Wednesday: "Available", Thursday: "Available", Friday: "Requested Off", Saturday: "Available", Sunday: "Available" } },
]

const initialShifts: Shift[] = [
  { id: 1, staffId: 1, day: "Monday", time: "11:00 AM - 11:00 PM", notes: "" },
  { id: 2, staffId: 2, day: "Monday", time: "11:00 AM - 7:00 PM", notes: "" },
  { id: 3, staffId: 3, day: "Monday", time: "11:00 AM - 7:00 PM", notes: "" },
  { id: 4, staffId: 4, day: "Monday", time: "3:00 PM - 11:00 PM", notes: "" },
  { id: 5, staffId: 5, day: "Tuesday", time: "11:00 AM - 7:00 PM", notes: "" },
  { id: 6, staffId: 6, day: "Monday", time: "11:00 AM - 7:00 PM", notes: "" },
  { id: 7, staffId: 7, day: "Monday", time: "11:00 AM - 3:00 PM", notes: "" },
  { id: 8, staffId: 8, day: "Tuesday", time: "3:00 PM - 11:00 PM", notes: "" },
  { id: 9, staffId: 9, day: "Monday", time: "11:00 AM - 11:00 PM", notes: "" },
  { id: 10, staffId: 10, day: "Monday", time: "11:00 AM - 7:00 PM", notes: "" },
  { id: 11, staffId: 2, day: "Tuesday", time: "11:00 AM - 7:00 PM", notes: "" },
  { id: 12, staffId: 4, day: "Tuesday", time: "3:00 PM - 11:00 PM", notes: "" },
  { id: 13, staffId: 3, day: "Wednesday", time: "3:00 PM - 11:00 PM", notes: "" },
  { id: 14, staffId: 6, day: "Friday", time: "3:00 PM - 11:00 PM", notes: "" },
  { id: 15, staffId: 5, day: "Saturday", time: "11:00 AM - 7:00 PM", notes: "" },
]

const initialChecklist: ChecklistItem[] = [
  { id: 1, task: "Unlock restaurant & disable alarm", category: "Opening", assignedRole: "Manager", completed: false },
  { id: 2, task: "Inspect kitchen equipment (grills, ovens, fryers)", category: "Opening", assignedRole: "Head Chef", completed: false },
  { id: 3, task: "Prep mansaf lamb and broth", category: "Opening", assignedRole: "Prep Cook", completed: false },
  { id: 4, task: "Prepare hummus and falafel mix", category: "Opening", assignedRole: "Prep Cook", completed: false },
  { id: 5, task: "Set dining tables and check linens", category: "Opening", assignedRole: "Server", completed: false },
  { id: 6, task: "Stock delivery bags and insulated carriers", category: "Opening", assignedRole: "Delivery Driver", completed: false },
  { id: 7, task: "Set up POS system and cash drawer", category: "Opening", assignedRole: "Cashier", completed: false },
  { id: 8, task: "Check and restock shawarma stations", category: "Midday", assignedRole: "Line Cook", completed: false },
  { id: 9, task: "Clear and wipe dining tables", category: "Midday", assignedRole: "Busser", completed: false },
  { id: 10, task: "Restock beverages and condiments", category: "Midday", assignedRole: "Server", completed: false },
  { id: 11, task: "Run lunch dishwashing cycle", category: "Midday", assignedRole: "Dishwasher", completed: false },
  { id: 12, task: "Verify delivery order queue", category: "Midday", assignedRole: "Manager", completed: false },
  { id: 13, task: "Clean and sanitize all kitchen surfaces", category: "Closing", assignedRole: "Line Cook", completed: false },
  { id: 14, task: "Store leftover food properly — label & date", category: "Closing", assignedRole: "Head Chef", completed: false },
  { id: 15, task: "Cash drawer reconciliation", category: "Closing", assignedRole: "Cashier", completed: false },
  { id: 16, task: "Mop kitchen and dining floors", category: "Closing", assignedRole: "Dishwasher", completed: false },
  { id: 17, task: "Set alarm and lock up", category: "Closing", assignedRole: "Manager", completed: false },
  { id: 18, task: "Final delivery vehicle check & fuel log", category: "Closing", assignedRole: "Delivery Driver", completed: false },
]

const ROLES: Role[] = ["Manager", "Head Chef", "Line Cook", "Prep Cook", "Server", "Host", "Busser", "Delivery Driver", "Dishwasher", "Cashier"]

export default function StaffSchedulingPage() {
  const [activeTab, setActiveTab] = useState<"schedule" | "staff" | "checklist" | "analytics">("schedule")
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [shifts, setShifts] = useState<Shift[]>(initialShifts)
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist)
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [showAddShift, setShowAddShift] = useState(false)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [showStaffDetail, setShowStaffDetail] = useState<StaffMember | null>(null)
  const [editShift, setEditShift] = useState<Shift | null>(null)
  const [checklistFilter, setChecklistFilter] = useState<"All" | "Opening" | "Midday" | "Closing">("All")

  const [newShift, setNewShift] = useState({ staffId: 0, day: "Monday", time: SHIFT_TIMES[0], notes: "" })
  const [newStaff, setNewStaff] = useState({ name: "", role: ROLES[0] as Role, hourlyRate: 12, phone: "", email: "" })

  const nextId = (arr: { id: number }[]) => Math.max(0, ...arr.map(a => a.id)) + 1

  const addShift = () => {
    if (!newShift.staffId) return
    const s = staff.find(s => s.id === newShift.staffId)
    if (!s) return
    if (s.availability[newShift.day] === "Unavailable") return
    setShifts(prev => [...prev, { ...newShift, id: nextId(prev) }])
    setShowAddShift(false)
    setNewShift({ staffId: 0, day: "Monday", time: SHIFT_TIMES[0], notes: "" })
  }

  const deleteShift = (id: number) => setShifts(prev => prev.filter(s => s.id !== id))

  const addStaff = () => {
    if (!newStaff.name) return
    const availability: Record<string, AvailabilityStatus> = {}
    DAYS.forEach(d => availability[d] = "Available")
    setStaff(prev => [...prev, { ...newStaff, id: nextId(prev), availability, color: "gray" }])
    setShowAddStaff(false)
    setNewStaff({ name: "", role: ROLES[0], hourlyRate: 12, phone: "", email: "" })
  }

  const toggleAvailability = (staffId: number, day: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id !== staffId) return s
      const cycle: AvailabilityStatus[] = ["Available", "Unavailable", "Requested Off"]
      const cur = s.availability[day]
      const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length]
      return { ...s, availability: { ...s.availability, [day]: next } }
    }))
  }

  const toggleChecklistItem = (id: number) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c))
  }

  const dayShifts = shifts.filter(s => s.day === selectedDay)

  const totalWeeklyHours = shifts.reduce((acc, shift) => acc + SHIFT_HOURS[shift.time], 0)
  const totalWeeklyCost = shifts.reduce((acc, shift) => {