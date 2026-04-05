"use client"

import { useState, useEffect } from "react"

type Tier = "Bronze" | "Silver" | "Gold" | "Platinum"
type SegmentKey = "all" | "bronze" | "silver" | "gold" | "platinum" | "inactive" | "newCustomers"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  joinDate: string
  lastVisit: string
  totalSpend: number
  visits: number
  points: number
  tier: Tier
  isActive: boolean
  favoriteItem: string
}

interface Campaign {
  id: number
  name: string
  segment: SegmentKey
  subject: string
  status: "draft" | "scheduled" | "sent"
  sentDate: string
  openRate: number
  clickRate: number
  recipients: number
}

interface Reward {
  id: number
  name: string
  pointsCost: number
  description: string
  category: string
  available: boolean
}

const SAMPLE_CUSTOMERS: Customer[] = [
  { id: 1, name: "Layla Hassan", email: "layla@email.com", phone: "+1-555-0101", joinDate: "2022-03-15", lastVisit: "2024-01-18", totalSpend: 487.50, visits: 28, points: 1462, tier: "Gold", isActive: true, favoriteItem: "Mansaf" },
  { id: 2, name: "Omar Khalil", email: "omar@email.com", phone: "+1-555-0102", joinDate: "2023-01-20", lastVisit: "2024-01-15", totalSpend: 892.00, visits: 52, points: 2676, tier: "Platinum", isActive: true, favoriteItem: "Shawarma" },
  { id: 3, name: "Sarah Mitchell", email: "sarah@email.com", phone: "+1-555-0103", joinDate: "2023-06-10", lastVisit: "2023-11-20", totalSpend: 234.00, visits: 14, points: 702, tier: "Silver", isActive: false, favoriteItem: "Falafel" },
  { id: 4, name: "James Park", email: "james@email.com", phone: "+1-555-0104", joinDate: "2024-01-05", lastVisit: "2024-01-19", totalSpend: 78.50, visits: 4, points: 235, tier: "Bronze", isActive: true, favoriteItem: "Hummus" },
  { id: 5, name: "Fatima Al-Rashid", email: "fatima@email.com", phone: "+1-555-0105", joinDate: "2021-09-22", lastVisit: "2024-01-20", totalSpend: 1204.00, visits: 71, points: 3612, tier: "Platinum", isActive: true, favoriteItem: "Mansaf" },
  { id: 6, name: "David Chen", email: "david@email.com", phone: "+1-555-0106", joinDate: "2023-08-14", lastVisit: "2023-12-01", totalSpend: 156.00, visits: 9, points: 468, tier: "Bronze", isActive: false, favoriteItem: "Shawarma" },
  { id: 7, name: "Nadia Yousef", email: "nadia@email.com", phone: "+1-555-0107", joinDate: "2022-11-30", lastVisit: "2024-01-17", totalSpend: 378.00, visits: 22, points: 1134, tier: "Silver", isActive: true, favoriteItem: "Hummus" },
  { id: 8, name: "Michael Torres", email: "michael@email.com", phone: "+1-555-0108", joinDate: "2023-03-08", lastVisit: "2024-01-12", totalSpend: 512.00, visits: 30, points: 1536, tier: "Gold", isActive: true, favoriteItem: "Falafel" },
  { id: 9, name: "Aisha Mansour", email: "aisha@email.com", phone: "+1-555-0109", joinDate: "2024-01-02", lastVisit: "2024-01-16", totalSpend: 45.00, visits: 2, points: 135, tier: "Bronze", isActive: true, favoriteItem: "Mansaf" },
  { id: 10, name: "Robert Kim", email: "robert@email.com", phone: "+1-555-0110", joinDate: "2022-05-19", lastVisit: "2023-10-14", totalSpend: 289.00, visits: 17, points: 867, tier: "Silver", isActive: false, favoriteItem: "Shawarma" },
]

const SAMPLE_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Ramadan Special Offer", segment: "gold", subject: "Exclusive Iftar Deals Just for You! 🌙", status: "sent", sentDate: "2024-01-10", openRate: 68, clickRate: 34, recipients: 2 },
  { id: 2, name: "Win-Back Inactive Customers", segment: "inactive", subject: "We Miss You! Come Back for a Free Falafel 🧆", status: "sent", sentDate: "2024-01-05", openRate: 45, clickRate: 22, recipients: 3 },
  { id: 3, name: "VIP Platinum Appreciation", segment: "platinum", subject: "Thank You for Being Our VIP! Special Surprise Inside 🎁", status: "scheduled", sentDate: "2024-01-25", openRate: 0, clickRate: 0, recipients: 2 },
  { id: 4, name: "New Member Welcome", segment: "newCustomers", subject: "Welcome to Taste of Amman Family! 🫓", status: "sent", sentDate: "2024-01-15", openRate: 82, clickRate: 51, recipients: 2 },
  { id: 5, name: "Monthly Newsletter", segment: "all", subject: "This Month at Taste of Amman - New Dishes & Events!", status: "draft", sentDate: "2024-02-01", openRate: 0, clickRate: 0, recipients: 10 },
]

const REWARDS: Reward[] = [
  { id: 1, name: "Free Falafel Plate", pointsCost: 200, description: "Enjoy a complimentary falafel plate with your meal", category: "Food", available: true },
  { id: 2, name: "Free Hummus", pointsCost: 150, description: "Get our signature hummus for free", category: "Food", available: true },
  { id: 3, name: "10% Off Next Visit", pointsCost: 300, description: "10% discount on your entire next order", category: "Discount", available: true },
  { id: 4, name: "Free Mansaf (Half)", pointsCost: 800, description: "Complimentary half portion of our famous Mansaf", category: "Food", available: true },
  { id: 5, name: "Birthday Free Meal", pointsCost: 500, description: "Free meal up to $25 on your birthday month", category: "Special", available: true },
  { id: 6, name: "Priority Reservation", pointsCost: 400, description: "Skip the wait with priority table booking", category: "Experience", available: true },
  { id: 7, name: "25% Off Catering", pointsCost: 1200, description: "25% off catering orders for events", category: "Discount", available: false },
  { id: 8, name: "Chef's Table Experience", pointsCost: 2000, description: "Exclusive behind-the-scenes dinner with our head chef", category: "Experience", available: true },
]

const tierColors: Record<Tier, string> = {
  Bronze: "text-amber-600 bg-amber-950/40 border-amber-700",
  Silver: "text-slate-300 bg-slate-800/60 border-slate-500",
  Gold: "text-yellow-400 bg-yellow-950/40 border-yellow-600",
  Platinum: "text-purple-300 bg-purple-950/40 border-purple-500",
}

const tierThresholds: Record<Tier, { min: number; max: number; color: string }> = {
  Bronze: { min: 0, max: 499, color: "#92400e" },
  Silver: { min: 500, max: 999, color: "#94a3b8" },
  Gold: { min: 1000, max: 2499, color: "#eab308" },
  Platinum: { min: 2500, max: Infinity, color: "#a855f7" },
}

const segmentLabels: Record<SegmentKey, string> = {
  all: "All Customers",
  bronze: "Bronze Members",
  silver: "Silver Members",
  gold: "Gold Members",
  platinum: "Platinum Members",
  inactive: "Inactive (60+ days)",
  newCustomers: "New Customers",
}

export default function LoyaltyDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "customers" | "campaigns" | "rewards">("dashboard")
  const [customers, setCustomers] = useState<Customer[]>(SAMPLE_CUSTOMERS)
  const [campaigns, setCampaigns] = useState<Campaign[]>(SAMPLE_CAMPAIGNS)
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newCampaign, setNewCampaign] = useState({ name: "", segment: "all" as SegmentKey, subject: "", status: "draft" as const })
  const [animatedStats, setAnimatedStats] = useState({ members: 0, points: 0, revenue: 0, campaigns: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        members: customers.length,
        points: customers.reduce((sum, c) => sum + c.points, 0),
        revenue: customers.reduce((sum, c) => sum + c.totalSpend, 0),
        campaigns: campaigns.filter(c => c.status === "sent").length,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [customers, campaigns])

  const getTierCounts = () => ({
    Bronze: customers.filter(c => c.tier === "Bronze").length,
    Silver: customers.filter(c => c.tier === "Silver").length,
    Gold: customers.filter(c => c.tier === "Gold").length,
    Platinum: customers.filter(c => c.tier === "Platinum").length,
  })

  const getFilteredCustomers = () => {
    let filtered = customers
    if (selectedSegment === "inactive") {
      filtered = customers.filter(c => !c.isActive)
    } else if (selectedSegment === "newCustomers") {
      filtered = customers.filter(c => c.visits <= 5)
    } else if (selectedSegment !== "all") {
      filtered = customers.filter(c => c.tier.toLowerCase() === selectedSegment)
    }
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }

  const getSegmentCount = (seg: SegmentKey) => {
    if (seg === "all") return customers.length
    if (seg === "inactive") return customers.filter(c => !c.isActive).length
    if (seg === "newCustomers") return customers.filter(c => c.visits <= 5).length
    return customers.filter(c => c.tier.toLowerCase() === seg).length
  }

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject) return
    const campaign: Campaign = {
      id: campaigns.length + 1,
      name: newCampaign.name,
      segment: newCampaign.segment,
      subject: newCampaign.subject,
      status: "draft",
      sentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      openRate: 0,
      clickRate: 0,
      recipients: getSegmentCount(newCampaign.segment),
    }
    setCampaigns([...campaigns, campaign])
    setNewCampaign({ name: "", segment: "all", subject: "", status: "draft" })
    setShowCampaignModal(false)
  }

  const handleAwardPoints = (customerId: number, points: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c
      const newPoints = c.points + points
      const newSpend = c.totalSpend + (points / 3)
      let newTier: Tier = "Bronze"
      if (newPoints >= 2500) newTier = "Platinum"
      else if (newPoints >= 1000) newTier = "Gold"
      else if (newPoints >= 500) newTier = "Silver"
      return { ...c, points: newPoints, totalSpend: newSpend, tier: newTier }
    }))
  }

  const tiers: Tier[] = ["Bronze", "Silver", "Gold", "Platinum"]
  const tierCounts = getTierCounts()
  const filteredCustomers = getFilteredCustomers()
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
              🫓
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Taste of Amman</h1>
              <p className="text-xs text-zinc-400">Loyalty Program Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Program Active
            </span>
          </div>
        </div>
      </header>

      {/* Nav Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {(["dashboard", "customers", "campaigns", "rewards"] as const).map(tab => (
              <button
                key={tab}