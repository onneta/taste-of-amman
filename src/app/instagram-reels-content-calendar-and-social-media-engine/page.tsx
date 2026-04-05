"use client"

import { useState, useEffect } from "react"

type Post = {
  id: string
  date: string
  time: string
  caption: string
  hashtags: string[]
  dish: string
  status: "scheduled" | "published" | "draft"
  likes?: number
  comments?: number
  views?: number
  reel_type: string
}

type DishSuggestion = {
  name: string
  emoji: string
  category: string
}

const DISHES: DishSuggestion[] = [
  { name: "Mansaf", emoji: "🍲", category: "Main" },
  { name: "Falafel", emoji: "🧆", category: "Appetizer" },
  { name: "Hummus", emoji: "🫙", category: "Appetizer" },
  { name: "Shawarma", emoji: "🌯", category: "Main" },
  { name: "Knafeh", emoji: "🍮", category: "Dessert" },
  { name: "Fattoush", emoji: "🥗", category: "Salad" },
  { name: "Maqluba", emoji: "🍛", category: "Main" },
  { name: "Musakhan", emoji: "🍗", category: "Main" },
  { name: "Baklava", emoji: "🥐", category: "Dessert" },
  { name: "Labneh", emoji: "🥛", category: "Appetizer" },
]

const REEL_TYPES = ["Behind the Scenes", "Recipe Reveal", "Chef Spotlight", "Customer Reaction", "Food Journey", "Daily Special", "Cultural Story"]

const CAPTION_TEMPLATES: Record<string, string[]> = {
  "Mansaf": [
    "Taste the soul of Jordan in every bite 🇯🇴✨ Our slow-cooked lamb mansaf is a labor of love, simmered for hours in jameed sauce to bring you the most authentic Jordanian experience in downtown. Come gather around the table with us tonight!",
    "Mansaf Monday hits different when it's made with grandma's recipe 💛 Our chef has been perfecting this dish since 2010 — tender lamb, fluffy rice, and that signature jameed yogurt sauce. Reserve your table now!",
  ],
  "Falafel": [
    "Crispy on the outside, heavenly on the inside 🧆💚 Our falafel is ground fresh every morning from chickpeas soaked overnight. 14 years of perfecting the perfect crunch — available for dine-in and delivery!",
    "Street food royalty has arrived 👑 Our fresh-made falafel wraps are bursting with herbs, tahini, and love. The taste of Amman's streets, right here downtown. Order yours today!",
  ],
  "Hummus": [
    "Silky smooth hummus made from scratch every single morning 🫙✨ No shortcuts, no cans — just dried chickpeas, tahini, lemon, and generations of flavor. Come dip into the good stuff!",
    "The hummus that started it all 💛 Since 2010, our homemade hummus has been the first thing guests reach for. Now it can be on your table too. Dine in or order delivery!",
  ],
  "Shawarma": [
    "Rotating since 11am, ready for your cravings 🌯🔥 Our shawarma is marinated in a secret blend of Middle Eastern spices and slow-roasted to juicy perfection. Downtown never smelled this good!",
    "The shawarma wrap of your dreams 🌯✨ Tender meat, garlic sauce, pickles, and freshly baked bread — all wrapped up in authentic Amman flavors. Available for dine-in and delivery!",
  ],
  "Knafeh": [
    "Dessert that dreams are made of 🍮🧡 Our knafeh is baked golden, drizzled with rose water syrup, and topped with pistachios — the perfect ending to your Jordanian feast. Ask about today's special!",
    "Sweet endings, Jordanian style 💛 Crispy, cheesy, syrupy knafeh that will transport you straight to the streets of Amman. The best dessert you'll have all week, guaranteed!",
  ],
}

const HASHTAG_SETS: Record<string, string[]> = {
  "Mansaf": ["#mansaf", "#jordanianfood", "#tasteofamman", "#authenticjordanian", "#middleeasternfood", "#lambdish", "#jordancuisine", "#foodie", "#dinnertime", "#jordanianculture"],
  "Falafel": ["#falafel", "#streetfood", "#vegetarian", "#middleeastern", "#tasteofamman", "#falafellover", "#crispy", "#foodphotography", "#jordanianfood", "#plantbased"],
  "Hummus": ["#hummus", "#homemade", "#freshhummus", "#middleeasternfood", "#tasteofamman", "#chickpeas", "#meze", "#foodie", "#jordanianfood", "#healthyeating"],
  "Shawarma": ["#shawarma", "#wraps", "#jordanianfood", "#tasteofamman", "#streetfood", "#spicedmeat", "#middleeasternfood", "#lunchtime", "#foodphotography", "#downtown"],
  "Knafeh": ["#knafeh", "#jordaniandessert", "#middleeasternsweets", "#tasteofamman", "#dessert", "#sweettooth", "#foodie", "#jordanianfood", "#bakedgoodness", "#rosewater"],
  "default": ["#tasteofamman", "#jordanianfood", "#middleeasternfood", "#authentic", "#foodie", "#restaurant", "#downtown", "#jordancuisine", "#familyowned", "#since2010"],
}

const MOCK_POSTS: Post[] = [
  { id: "1", date: "2024-01-15", time: "12:00", caption: "Taste the soul of Jordan in every bite 🇯🇴✨", hashtags: HASHTAG_SETS["Mansaf"], dish: "Mansaf", status: "published", likes: 423, comments: 38, views: 8920, reel_type: "Food Journey" },
  { id: "2", date: "2024-01-17", time: "18:00", caption: "Crispy on the outside, heavenly on the inside 🧆💚", hashtags: HASHTAG_SETS["Falafel"], dish: "Falafel", status: "published", likes: 567, comments: 52, views: 12400, reel_type: "Recipe Reveal" },
  { id: "3", date: "2024-01-19", time: "11:00", caption: "Silky smooth hummus made from scratch every morning 🫙✨", hashtags: HASHTAG_SETS["Hummus"], dish: "Hummus", status: "published", likes: 334, comments: 27, views: 7300, reel_type: "Behind the Scenes" },
  { id: "4", date: "2024-01-22", time: "13:00", caption: "Rotating since 11am, ready for your cravings 🌯🔥", hashtags: HASHTAG_SETS["Shawarma"], dish: "Shawarma", status: "scheduled", reel_type: "Daily Special" },
  { id: "5", date: "2024-01-24", time: "19:00", caption: "Dessert that dreams are made of 🍮🧡", hashtags: HASHTAG_SETS["Knafeh"], dish: "Knafeh", status: "scheduled", reel_type: "Chef Spotlight" },
  { id: "6", date: "2024-01-26", time: "16:00", caption: "", hashtags: [], dish: "Maqluba", status: "draft", reel_type: "Cultural Story" },
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function TasteOfAmmanReels() {
  const [activeTab, setActiveTab] = useState<"calendar" | "posts" | "composer" | "analytics">("calendar")
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(0)
  const [currentYear, setCurrentYear] = useState(2024)
  const [composerDish, setComposerDish] = useState("Mansaf")
  const [composerCaption, setComposerCaption] = useState("")
  const [composerHashtags, setComposerHashtags] = useState<string[]>([])
  const [composerDate, setComposerDate] = useState("")
  const [composerTime, setComposerTime] = useState("12:00")
  const [composerReelType, setComposerReelType] = useState("Food Journey")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [hashtagInput, setHashtagInput] = useState("")
  const [savedMessage, setSavedMessage] = useState("")

  useEffect(() => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }, [])

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay()

  const getPostsForDate = (dateStr: string) => posts.filter(p => p.date === dateStr)

  const formatDateStr = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${currentYear}-${m}-${d}`
  }

  const generateAISuggestion = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const captions = CAPTION_TEMPLATES[composerDish] || CAPTION_TEMPLATES["Hummus"]
      const randomCaption = captions[Math.floor(Math.random() * captions.length)]
      setComposerCaption(randomCaption)
      setComposerHashtags(HASHTAG_SETS[composerDish] || HASHTAG_SETS["default"])
      setIsGenerating(false)
    }, 1500)
  }

  const savePost = (status: "scheduled" | "draft") => {
    if (!composerCaption || !composerDate) {
      setSavedMessage("Please fill in caption and date!")
      setTimeout(() => setSavedMessage(""), 3000)
      return
    }
    const newPost: Post = {
      id: Date.now().toString(),
      date: composerDate,
      time: composerTime,
      caption: composerCaption,
      hashtags: composerHashtags,
      dish: composerDish,
      status,
      reel_type: composerReelType,
    }
    setPosts(prev => [...prev, newPost])
    setComposerCaption("")
    setComposerHashtags([])
    setComposerDate("")
    setComposerDish("Mansaf")
    setSavedMessage(status === "scheduled" ? "✅ Post scheduled!" : "💾 Draft saved!")
    setTimeout(() => setSavedMessage(""), 3000)
  }

  const addHashtag = () => {
    if (hashtagInput && !composerHashtags.includes(hashtagInput)) {
      setComposerHashtags(prev => [...prev, hashtagInput.startsWith("#") ? hashtagInput : `#${hashtagInput}`])
      setHashtagInput("")
    }
  }

  const removeHashtag = (tag: string) => {
    setComposerHashtags(prev => prev.filter(t => t !== tag))
  }

  const totalLikes = posts.filter(p => p.status === "published").reduce((s, p) => s + (p.likes || 0), 0)
  const totalViews = posts.filter(p => p.status === "published").reduce((s, p) => s + (p.views || 0), 0)
  const totalComments = posts.filter(p => p.status === "published").reduce((s, p) => s + (p.comments || 0), 0)
  const publishedCount = posts.filter(p => p.status === "published").length
  const scheduledCount = posts.filter(p => p.status === "scheduled").length
  const draftCount = posts.filter(p => p.status === "draft").length

  const statusColor = (status: string) => {
    if (status === "published") return "bg-emerald-500"
    if (status === "scheduled") return "bg-amber-500"
    return "bg-zinc-500"
  }

  const statusBadge = (status: string) => {
    if (status === "published") return "bg-emerald-900 text-emerald-300 border border-emerald-700"
    if (status === "scheduled") return "bg-amber-900 text-amber-300 border border-amber-700"
    return "bg-zinc-800 text-zinc-400 border border-zinc-600"
  }

  const getDishEmoji = (name: string) => DISHES.find(d => d.name === name)?.emoji || "🍽️"

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
              🕌
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-400 tracking-tight">Taste of Amman</h1>
              <p className="text-xs text-zinc-400">Instagram Reels Content Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-1.5 border border-zinc-700">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-zinc-300">@tasteofamman.jo</span>
            </div>
            <button
              onClick={() => { setActiveTab("composer"); setComposerDate("") }}