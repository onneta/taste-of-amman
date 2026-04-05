"use client"

import { useState, useEffect, useCallback } from "react"

type MenuItem = {
  id: string
  name: string
  nameAr: string
  description: string
  price: number
  category: string
  image: string
  popular?: boolean
  spicy?: boolean
}

type CartItem = MenuItem & { quantity: number; notes?: string }

type DeliveryZone = {
  name: string
  fee: number
  minOrder: number
  estimatedTime: string
}

type OrderStep = "menu" | "cart" | "delivery" | "payment" | "confirmation"

const MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Mansaf", nameAr: "منسف", description: "Traditional Jordanian lamb dish with jameed sauce, served on a bed of rice and flatbread", price: 24.99, category: "Mains", image: "🍲", popular: true },
  { id: "2", name: "Shawarma Plate", nameAr: "شاورما", description: "Slow-roasted marinated meat, served with garlic sauce, pickles, and fresh pita", price: 16.99, category: "Mains", image: "🥙", popular: true },
  { id: "3", name: "Falafel Platter", nameAr: "فلافل", description: "Crispy golden chickpea fritters with tahini, tomatoes, and fresh herbs", price: 13.99, category: "Starters", image: "🧆", popular: true },
  { id: "4", name: "Hummus", nameAr: "حمص", description: "Classic creamy hummus drizzled with olive oil and paprika, served with warm pita", price: 9.99, category: "Starters", image: "🫙" },
  { id: "5", name: "Meze Platter", nameAr: "مازة", description: "Assorted appetizers: hummus, baba ganoush, tabbouleh, and olives", price: 19.99, category: "Starters", image: "🍽️" },
  { id: "6", name: "Maqluba", nameAr: "مقلوبة", description: "Upside-down rice dish with vegetables and tender chicken or lamb", price: 21.99, category: "Mains", image: "🥘" },
  { id: "7", name: "Grilled Kofta", nameAr: "كفتة", description: "Spiced ground lamb and beef skewers, served with rice and salad", price: 18.99, category: "Mains", image: "🍢", spicy: true },
  { id: "8", name: "Tabbouleh", nameAr: "تبولة", description: "Fresh parsley salad with bulgur, tomatoes, mint, and lemon dressing", price: 8.99, category: "Salads", image: "🥗" },
  { id: "9", name: "Fattoush", nameAr: "فتوش", description: "Crispy bread salad with seasonal vegetables and sumac vinaigrette", price: 8.99, category: "Salads", image: "🥙" },
  { id: "10", name: "Lamb Ouzi", nameAr: "أوزي", description: "Slow-cooked whole lamb with aromatic spiced rice and nuts", price: 26.99, category: "Mains", image: "🍗", popular: true },
  { id: "11", name: "Knafeh", nameAr: "كنافة", description: "Traditional cheese pastry soaked in rose water syrup, topped with pistachios", price: 7.99, category: "Desserts", image: "🍮", popular: true },
  { id: "12", name: "Baklava", nameAr: "بقلاوة", description: "Layers of crispy phyllo dough with nuts and honey syrup", price: 6.99, category: "Desserts", image: "🍯" },
  { id: "13", name: "Turkish Coffee", nameAr: "قهوة تركية", description: "Rich traditional cardamom-spiced coffee served in a small cup", price: 4.99, category: "Drinks", image: "☕" },
  { id: "14", name: "Mint Lemonade", nameAr: "ليمون بالنعنع", description: "Freshly squeezed lemonade blended with fresh mint leaves", price: 4.99, category: "Drinks", image: "🍋" },
  { id: "15", name: "Jallab", nameAr: "جلاب", description: "Sweet grape and rose water drink with pine nuts and raisins", price: 5.99, category: "Drinks", image: "🍇" },
]

const DELIVERY_ZONES: DeliveryZone[] = [
  { name: "Downtown (0-2 miles)", fee: 2.99, minOrder: 20, estimatedTime: "25-35 min" },
  { name: "Midtown (2-4 miles)", fee: 4.99, minOrder: 25, estimatedTime: "35-45 min" },
  { name: "Uptown (4-6 miles)", fee: 6.99, minOrder: 30, estimatedTime: "45-55 min" },
  { name: "Suburbs (6-10 miles)", fee: 9.99, minOrder: 40, estimatedTime: "55-70 min" },
]

const CATEGORIES = ["All", "Starters", "Mains", "Salads", "Desserts", "Drinks"]

function formatPrice(amount: number) {
  return `$${amount.toFixed(2)}`
}

function generateOrderId() {
  return "TOA-" + Math.random().toString(36).substr(2, 8).toUpperCase()
}

export default function TasteOfAmmanOrdering() {
  const [step, setStep] = useState<OrderStep>("menu")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery")
  const [searchQuery, setSearchQuery] = useState("")
  const [noteModalItem, setNoteModalItem] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [paymentData, setPaymentData] = useState({ cardNumber: "", expiry: "", cvv: "", name: "", email: "", phone: "", address: "" })
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [cartOpen, setCartOpen] = useState(false)
  const [addressSuggestions] = useState(["123 Main St, Downtown", "456 Oak Ave, Midtown", "789 Pine Rd, Uptown"])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = orderType === "delivery" && selectedZone ? selectedZone.fee : 0
  const discount = promoApplied ? subtotal * 0.1 : 0
  const tax = (subtotal - discount) * 0.08
  const total = subtotal + deliveryFee - discount + tax

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id)
      if (existing && existing.quantity > 1) return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c)
      return prev.filter(c => c.id !== id)
    })
  }, [])

  const deleteFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(c => c.id !== id))
  }, [])

  const getCartQty = (id: string) => cart.find(c => c.id === id)?.quantity || 0

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "AMMAN10") {
      setPromoApplied(true)
      setPromoError("")
    } else {
      setPromoError("Invalid promo code. Try AMMAN10 for 10% off!")
      setPromoApplied(false)
    }
  }

  const validatePayment = () => {
    const errors: Record<string, string> = {}
    if (!paymentData.name.trim()) errors.name = "Name is required"
    if (!paymentData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Valid email required"
    if (!paymentData.phone.match(/^\d{10}$/)) errors.phone = "Valid 10-digit phone required"
    if (orderType === "delivery" && !paymentData.address.trim()) errors.address = "Delivery address required"
    const cleanCard = paymentData.cardNumber.replace(/\s/g, "")
    if (!cleanCard.match(/^\d{16}$/)) errors.cardNumber = "Valid 16-digit card number required"
    if (!paymentData.expiry.match(/^\d{2}\/\d{2}$/)) errors.expiry = "Format MM/YY"
    if (!paymentData.cvv.match(/^\d{3,4}$/)) errors.cvv = "3-4 digit CVV required"
    return errors
  }

  const handlePayment = async () => {
    const errors = validatePayment()
    if (Object.keys(errors).length > 0) { setPaymentErrors(errors); return }
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 2500))
    setIsProcessing(false)
    setOrderId(generateOrderId())
    setEstimatedTime(orderType === "delivery" && selectedZone ? selectedZone.estimatedTime : "20-25 min")
    setStep("confirmation")
    setCart([])
  }

  const formatCard = (val: string) => val.replace(/\D/g, "").substring(0, 16).replace(/(\d{4})/g, "$1 ").trim()
  const formatExpiry = (val: string) => { const v = val.replace(/\D/g, "").substring(0, 4); return v.length >= 2 ? v.substring(0, 2) + "/" + v.substring(2) : v }

  const canProceedToPayment = orderType === "pickup" || (orderType === "delivery" && selectedZone !== null)
  const meetsMinOrder = orderType === "delivery" && selectedZone ? subtotal >= selectedZone.minOrder : true

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg">🕌</div>
            <div>
              <h1 className="font-bold text-lg text-amber-400">Taste of Amman</h1>
              <p className="text-xs text-zinc-400">Authentic Jordanian Cuisine · Open 11AM–11PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {step === "menu" && (
              <button onClick={() => { setCartOpen(!cartOpen); setStep("menu") }} className="relative p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                🛒
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-zinc-950 text-xs font-bold rounded-full flex items-center justify-center">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>
            )}
            {step !== "menu" && step !== "confirmation" && (
              <button onClick={() => { if (step === "cart") setStep("menu"); if (step === "delivery") setStep("cart"); if (step === "payment") setStep("delivery") }} className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-1">
                ← Back
              </button>
            )}
          </div>
        </div>
        {/* Steps indicator */}
        {step !== "menu" && step !== "confirmation" && (
          <div className="max-w-6xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-2 text-xs">
              {(["cart", "delivery", "payment"] as OrderStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step === s ? "bg-amber-500 text-zinc-950" : (["cart", "delivery", "payment"].indexOf(step) > i ? "bg-green-500 text-zinc-950" : "bg-zinc-700 text-zinc-400")}`}>{i + 1}</div>
                  <span className={step === s ? "text-amber-400" : "text-zinc-500"}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                  {i < 2 && <span className="text-zinc-700">›</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* MENU PAGE */}
        {step === "menu" && (
          <div className="flex gap-6">
            <div className="flex-1">
              {/* Hero */}
              <div className="relative rounded-2xl overflow-hidden mb-6 bg-gradient-to-r from-amber-900/40 to-orange-900/30 border border-amber-800/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber