"use client"

import { useState, useEffect } from "react"

type Tab = "profile" | "reviews" | "requests" | "analytics"

interface Review {
  id: number
  author: string
  rating: number
  date: string
  text: string
  replied: boolean
  reply?: string
  platform: string
}

interface ReviewRequest {
  id: number
  customerName: string
  phone?: string
  email?: string
  method: "sms" | "email"
  status: "pending" | "sent" | "opened" | "reviewed"
  sentAt?: string
  orderDate: string
}

const mockReviews: Review[] = [
  { id: 1, author: "Sarah M.", rating: 5, date: "2024-01-15", text: "Absolutely the best mansaf I've had outside of Jordan! The lamb was tender, the jameed sauce was rich and authentic. Family-owned feel with incredible hospitality.", replied: true, reply: "Thank you so much, Sarah! Mansaf is our pride and joy — it's been my grandmother's recipe since we opened in 2010. We hope to see you again soon! 🇯🇴", platform: "Google" },
  { id: 2, author: "James K.", rating: 4, date: "2024-01-12", text: "Great falafel and hummus. Service was a bit slow but worth the wait. The pita bread is freshly baked and delicious.", replied: false, platform: "Google" },
  { id: 3, author: "Layla R.", rating: 5, date: "2024-01-10", text: "Finally found authentic Jordanian food downtown! The shawarma is incredible and the staff made us feel so welcome. Will definitely be back.", replied: true, reply: "Layla, your kind words mean the world to our family! We're so happy to bring a taste of Amman to downtown. See you soon! 🤍", platform: "Google" },
  { id: 4, author: "Mike T.", rating: 3, date: "2024-01-08", text: "Food was decent but portions felt small for the price. The atmosphere is nice though and the hummus was very smooth.", replied: false, platform: "Google" },
  { id: 5, author: "Fatima A.", rating: 5, date: "2024-01-05", text: "The best middle eastern restaurant in the city hands down. Authentic flavors, generous portions, and the warmest staff. The family platter is perfect for groups!", replied: true, reply: "Fatima, thank you for the glowing review! Our family platter is definitely the way to go for groups. We love feeding big families — it's what we do best! 💚", platform: "Google" },
  { id: 6, author: "David L.", rating: 2, date: "2024-01-03", text: "Waited 45 minutes for food and it arrived cold. Very disappointed as I had heard great things. Maybe just an off night?", replied: false, platform: "Google" },
]

const mockRequests: ReviewRequest[] = [
  { id: 1, customerName: "Ahmed Hassan", phone: "+1-555-0123", method: "sms", status: "reviewed", orderDate: "2024-01-14", sentAt: "2024-01-14 8:30 PM" },
  { id: 2, customerName: "Jennifer W.", email: "jen.w@email.com", method: "email", status: "opened", orderDate: "2024-01-13", sentAt: "2024-01-13 9:15 PM" },
  { id: 3, customerName: "Omar S.", phone: "+1-555-0456", method: "sms", status: "sent", orderDate: "2024-01-13", sentAt: "2024-01-13 8:45 PM" },
  { id: 4, customerName: "Rachel B.", email: "rachel.b@email.com", method: "email", status: "pending", orderDate: "2024-01-15" },
  { id: 5, customerName: "Khalid M.", phone: "+1-555-0789", method: "sms", status: "reviewed", orderDate: "2024-01-12", sentAt: "2024-01-12 9:00 PM" },
]

const ratingTrends = [
  { month: "Aug", avg: 4.1, count: 18 },
  { month: "Sep", avg: 4.3, count: 22 },
  { month: "Oct", avg: 4.2, count: 19 },
  { month: "Nov", avg: 4.4, count: 28 },
  { month: "Dec", avg: 4.6, count: 35 },
  { month: "Jan", avg: 4.7, count: 12 },
]

const ratingDistribution = [
  { stars: 5, count: 48, pct: 57 },
  { stars: 4, count: 22, pct: 26 },
  { stars: 3, count: 8, pct: 10 },
  { stars: 2, count: 4, pct: 5 },
  { stars: 1, count: 2, pct: 2 },
]

const profileFields = [
  { label: "Business Name", value: "Taste of Amman", complete: true, category: "basics" },
  { label: "Primary Category", value: "Jordanian Restaurant", complete: true, category: "basics" },
  { label: "Address", value: "124 Downtown Ave, City, ST 00000", complete: true, category: "basics" },
  { label: "Phone Number", value: "+1 (555) 012-3456", complete: true, category: "basics" },
  { label: "Website URL", value: "www.tasteofamman.com", complete: true, category: "basics" },
  { label: "Hours (Mon-Sun)", value: "11:00 AM – 11:00 PM", complete: true, category: "basics" },
  { label: "Description (750 chars)", value: "75% filled", complete: false, category: "content" },
  { label: "Menu Link / Upload", value: "Not linked", complete: false, category: "content" },
  { label: "Services (Dine-In, Delivery)", value: "Dine-In only listed", complete: false, category: "content" },
  { label: "Price Range", value: "$$ ($15–$25)", complete: true, category: "content" },
  { label: "Profile Photos (10+)", value: "4 photos uploaded", complete: false, category: "media" },
  { label: "Cover Photo", value: "Uploaded", complete: true, category: "media" },
  { label: "Menu Photos", value: "Not uploaded", complete: false, category: "media" },
  { label: "Weekly Posts", value: "Last post 3 weeks ago", complete: false, category: "engagement" },
  { label: "Q&A Responses", value: "2 unanswered", complete: false, category: "engagement" },
  { label: "Attributes (Halal, etc.)", value: "Not set", complete: false, category: "engagement" },
]

export default function TasteOfAmmanGBP() {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [requests, setRequests] = useState<ReviewRequest[]>(mockRequests)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [filterRating, setFilterRating] = useState<number | "all">("all")
  const [filterReplied, setFilterReplied] = useState<"all" | "replied" | "unreplied">("all")
  const [newRequest, setNewRequest] = useState({ name: "", contact: "", method: "sms" as "sms" | "email" })
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [smsTemplate, setSmsTemplate] = useState("Hi [Name]! Thank you for dining at Taste of Amman tonight 🍽️ We hope you enjoyed your meal! We'd love to hear your feedback — could you spare 2 minutes to leave us a Google review? It means the world to our family-owned restaurant 🤍 [Review Link]")
  const [emailTemplate, setEmailTemplate] = useState("Subject: How was your meal at Taste of Amman?\n\nDear [Name],\n\nThank you for joining us at Taste of Amman! We hope you enjoyed a taste of authentic Jordanian cuisine.\n\nYour opinion matters deeply to us. Would you take a moment to share your experience on Google? It helps other food lovers discover us!\n\n👉 [Review Link]\n\nWith gratitude,\nThe Taste of Amman Family 🇯🇴")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [profileScore, setProfileScore] = useState(0)
  const [profileCategory, setProfileCategory] = useState("basics")

  useEffect(() => {
    const complete = profileFields.filter(f => f.complete).length
    setProfileScore(Math.round((complete / profileFields.length) * 100))
  }, [])

  const filteredReviews = reviews.filter(r => {
    const ratingOk = filterRating === "all" || r.rating === filterRating
    const replyOk = filterReplied === "all" || (filterReplied === "replied" ? r.replied : !r.replied)
    return ratingOk && replyOk
  })

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  const handleReply = (id: number) => {
    if (!replyText.trim()) return
    setReviews(prev => prev.map(r => r.id === id ? { ...r, replied: true, reply: replyText } : r))
    setReplyingTo(null)
    setReplyText("")
  }

  const generateAISuggestion = (review: Review) => {
    setIsGenerating(true)
    setAiSuggestion("")
    setTimeout(() => {
      const templates = {
        5: [
          `Thank you so much, ${review.author.split(" ")[0]}! 🤍 Your kind words fill our hearts with joy. Reviews like yours remind us why we love sharing the flavors of Amman with our community. We opened in 2010 to bring authentic Jordanian cuisine downtown, and guests like you make it all worthwhile. We look forward to welcoming you back soon! — The Taste of Amman Family 🇯🇴`,
          `${review.author.split(" ")[0]}, you just made our whole team smile! 😊 We're so grateful you enjoyed your meal. Our recipes have been passed down through generations, and it means everything to know you can taste the love in every dish. Please come back and try our mansaf if you haven't — it's our pride and joy! 💚`
        ],
        4: [
          `Thank you for the lovely feedback, ${review.author.split(" ")[0]}! We're so glad you enjoyed your visit. We always strive to improve, and your comments help us get there. We hope to see you again soon for an even better experience! 🍽️`,
          `${review.author.split(" ")[0]}, thank you for taking the time to share your experience! We're happy you enjoyed the food. We're always working to make every visit perfect — hope to welcome you back soon! 🌟`
        ],
        3: [
          `Thank you for your honest feedback, ${review.author.split(" ")[0]}. We truly appreciate you sharing your thoughts — it helps us improve. We're sorry your experience wasn't perfect and would love the chance to make it right. Please reach out to us directly at info@tasteofamman.com. We'd love to invite you back for a complimentary experience! 🤍`,
        ],
        2: [
          `Dear ${review.author.split(" ")[0]}, thank you for being honest with us. We're genuinely sorry your experience fell short of expectations — that's not the standard we hold ourselves to. We'd love to speak with you directly. Please contact us at (555) 012-3456 so we can make this right. Your satisfaction means everything to our family. 🙏`,
        ],
        1: [
          `Dear ${review.author.split(" ")[0]}, we sincerely apologize for the experience you had. This is not who we are or what we stand for. Please reach out directly at (555) 012-3456 — we want to personally address your concerns and make it up to you. Thank you for giving us the chance to improve. — Management, Taste of Amman`,
        ]
      }
      const options = templates[review.rating as keyof typeof templates] || templates[3]
      setAiSuggestion(options[Math.floor(Math.random() * options.length)])
      setIsGenerating(false)
    }, 1500)
  }

  const sendRequest = (id: number) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "sent", sentAt: new Date().toLocaleString() } : r))
  }

  const addNewRequest = () => {
    if (!newRequest.name || !newRequest.contact) return
    const req: ReviewRequest = {
      id: Date.now(),
      customerName: newRequest.name,
      [newRequest.method === "sms" ? "phone" : "email"]: newRequest.contact,
      method: newRequest.method,
      status: "pending",
      orderDate: new Date().toISOString().split("T")[0]
    }
    setRequests(prev => [req, ...prev])
    setNewRequest({ name: "", contact: "", method: "sms" })
    setShowNewRequestForm(false)
  }

  const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => {
    const sz = size === "lg" ? "w-6 h-6" : "w-4 h-4"
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} className={`${sz} ${s <= rating ? "text-amber-400" : "text-zinc-600"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile Optimizer", icon: "🏪" },
    { id: "reviews", label: "Review Manager", icon: "⭐" },
    { id: "requests", label: "Review Requests", icon: "📲" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ]

  const profileCategories = ["basics", "content", "media",