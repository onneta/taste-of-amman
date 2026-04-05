"use client"

import { useState, useEffect } from "react"

type Segment = "lapsed" | "high_spender" | "birthday"
type CampaignStatus = "active" | "paused" | "draft"

interface Campaign {
  id: string
  name: string
  segment: Segment
  status: CampaignStatus
  subject: string
  rewardMilestone: number
  discountPercent: number
  sentCount: number
  openRate: number
  redemptionRate: number
  revenueAttributed: number
  lastSent: string
}

interface Customer {
  id: string
  name: string
  segment: Segment
  email: string
  points: number
  lastVisit: string
  totalSpend: number
  birthday: string
}

interface MilestoneConfig {
  points: number
  reward: string
  discountPercent: number
}

const initialCampaigns: Campaign[] = [
  {
    id: "c1",
    name: "We Miss You",
    segment: "lapsed",
    status: "active",
    subject: "It's been a while — come back for a special treat 🧆",
    rewardMilestone: 100,
    discountPercent: 20,
    sentCount: 342,
    openRate: 38.4,
    redemptionRate: 14.2,
    revenueAttributed: 4820,
    lastSent: "2024-06-10",
  },
  {
    id: "c2",
    name: "VIP High Spender",
    segment: "high_spender",
    status: "active",
    subject: "You're a Taste of Amman VIP — exclusive offer inside 👑",
    rewardMilestone: 500,
    discountPercent: 15,
    sentCount: 128,
    openRate: 52.1,
    redemptionRate: 29.7,
    revenueAttributed: 8340,
    lastSent: "2024-06-12",
  },
  {
    id: "c3",
    name: "Birthday Celebration",
    segment: "birthday",
    status: "active",
    subject: "Happy Birthday! A gift from our table to yours 🎂",
    rewardMilestone: 50,
    discountPercent: 25,
    sentCount: 89,
    openRate: 71.3,
    redemptionRate: 44.9,
    revenueAttributed: 3210,
    lastSent: "2024-06-14",
  },
  {
    id: "c4",
    name: "Lapsed Re-engage v2",
    segment: "lapsed",
    status: "draft",
    subject: "Mansaf is waiting for you — 20% off this weekend 🍖",
    rewardMilestone: 100,
    discountPercent: 20,
    sentCount: 0,
    openRate: 0,
    redemptionRate: 0,
    revenueAttributed: 0,
    lastSent: "—",
  },
]

const initialCustomers: Customer[] = [
  { id: "u1", name: "Sara Al-Khalidi", segment: "birthday", email: "sara@email.com", points: 320, lastVisit: "2024-06-01", totalSpend: 480, birthday: "June" },
  { id: "u2", name: "Omar Nasser", segment: "high_spender", email: "omar@email.com", points: 1240, lastVisit: "2024-06-13", totalSpend: 2100, birthday: "October" },
  { id: "u3", name: "Lina Barakat", segment: "lapsed", email: "lina@email.com", points: 80, lastVisit: "2024-02-20", totalSpend: 215, birthday: "March" },
  { id: "u4", name: "Khalid Mansour", segment: "high_spender", email: "khalid@email.com", points: 890, lastVisit: "2024-06-11", totalSpend: 1750, birthday: "August" },
  { id: "u5", name: "Rima Tawil", segment: "lapsed", email: "rima@email.com", points: 60, lastVisit: "2024-01-15", totalSpend: 140, birthday: "November" },
  { id: "u6", name: "Faris Younis", segment: "birthday", email: "faris@email.com", points: 210, lastVisit: "2024-06-08", totalSpend: 390, birthday: "June" },
]

const milestoneDefaults: Record<Segment, MilestoneConfig> = {
  lapsed: { points: 100, reward: "Free Falafel Plate", discountPercent: 20 },
  high_spender: { points: 500, reward: "Complimentary Mansaf Upgrade", discountPercent: 15 },
  birthday: { points: 50, reward: "Free Dessert + Birthday Discount", discountPercent: 25 },
}

const segmentColors: Record<Segment, string> = {
  lapsed: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  high_spender: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  birthday: "text-pink-400 bg-pink-400/10 border-pink-400/30",
}

const segmentLabels: Record<Segment, string> = {
  lapsed: "Lapsed Customer",
  high_spender: "High Spender",
  birthday: "Birthday Month",
}

const segmentIcons: Record<Segment, string> = {
  lapsed: "😴",
  high_spender: "👑",
  birthday: "🎂",
}

const statusColors: Record<CampaignStatus, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  paused: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  draft: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",
}

export default function LoyaltyCampaignPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "campaigns" | "segments" | "milestones">("dashboard")
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [customers] = useState<Customer[]>(initialCustomers)
  const [milestones, setMilestones] = useState<Record<Segment, MilestoneConfig>>(milestoneDefaults)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [editMilestone, setEditMilestone] = useState<Segment | null>(null)
  const [milestoneEdit, setMilestoneEdit] = useState<MilestoneConfig>({ points: 0, reward: "", discountPercent: 0 })

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    segment: "lapsed" as Segment,
    subject: "",
    discountPercent: 20,
  })

  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenueAttributed, 0)
  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0)
  const avgOpenRate = campaigns.filter(c => c.sentCount > 0).reduce((sum, c) => sum + c.openRate, 0) / campaigns.filter(c => c.sentCount > 0).length
  const avgRedemption = campaigns.filter(c => c.sentCount > 0).reduce((sum, c) => sum + c.redemptionRate, 0) / campaigns.filter(c => c.sentCount > 0).length

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c
      const next = c.status === "active" ? "paused" : c.status === "paused" ? "active" : c.status
      return { ...c, status: next }
    }))
    showNotification("Campaign status updated")
  }

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
    setSelectedCampaign(null)
    showNotification("Campaign deleted")
  }

  const createCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject) return
    const c: Campaign = {
      id: `c${Date.now()}`,
      name: newCampaign.name,
      segment: newCampaign.segment,
      status: "draft",
      subject: newCampaign.subject,
      rewardMilestone: milestones[newCampaign.segment].points,
      discountPercent: newCampaign.discountPercent,
      sentCount: 0,
      openRate: 0,
      redemptionRate: 0,
      revenueAttributed: 0,
      lastSent: "—",
    }
    setCampaigns(prev => [...prev, c])
    setShowNewCampaign(false)
    setNewCampaign({ name: "", segment: "lapsed", subject: "", discountPercent: 20 })
    showNotification("New campaign created!")
  }

  const saveMilestone = () => {
    if (!editMilestone) return
    setMilestones(prev => ({ ...prev, [editMilestone]: milestoneEdit }))
    setEditMilestone(null)
    showNotification("Milestone configuration saved")
  }

  const segmentCounts = {
    lapsed: customers.filter(c => c.segment === "lapsed").length,
    high_spender: customers.filter(c => c.segment === "high_spender").length,
    birthday: customers.filter(c => c.segment === "birthday").length,
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-amber-500 text-zinc-950 px-5 py-3 rounded-xl shadow-2xl font-semibold text-sm animate-pulse">
          ✓ {notification}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-amber-950/20 to-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-20 text-9xl">🫓</div>
          <div className="absolute top-5 right-40 text-8xl">🧆</div>
          <div className="absolute bottom-0 left-1/2 text-9xl">🍖</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🍽️</span>
                <span className="text-amber-400 font-semibold text-sm tracking-widest uppercase">Taste of Amman — Est. 2010</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                Loyalty Campaign<br />
                <span className="text-amber-400">Automation</span>
              </h1>
              <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
                Automated email campaigns for lapsed customers, high spenders & birthday guests. 
                Rewarding loyalty with authentic Jordanian hospitality.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center min-w-[120px]">
                <div className="text-2xl font-black text-amber-400">${totalRevenue.toLocaleString()}</div>
                <div className="text-zinc-500 text-xs mt-1">Total Revenue Attributed</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center min-w-[120px]">
                <div className="text-2xl font-black text-emerald-400">{totalSent.toLocaleString()}</div>
                <div className="text-zinc-500 text-xs mt-1">Emails Sent</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-400">{avgOpenRate.toFixed(1)}%</div>
                <div className="text-zinc-500 text-xs mt-1">Avg Open Rate</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-pink-400">{avgRedemption.toFixed(1)}%</div>
                <div className="text-zinc-500 text-xs mt-1">Avg Redemption</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-800 bg-zinc-950/90 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {([
              { key: "dashboard", label: "📊 Dashboard", },
              { key: "campaigns", label: "📧 Campaigns" },
              { key: "segments", label: "👥 Segments" },
              { key: "milestones", label: "🏆 Milestones" },
            ] as { key: typeof activeTab; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.key
                    ? "border-amber-400 text-amber-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Campaign Performance Overview</h