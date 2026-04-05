"use client"

import { useState, useEffect, useCallback } from "react"

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  emoji: string
  popular?: boolean
  spicy?: boolean
}

type CartItem = MenuItem & { quantity: number; specialInstructions?: string }

type Order = {
  id: string
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "delivered"
  timestamp: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address?: string
  orderType: "delivery" | "pickup"
  paymentMethod: string
  estimatedTime: number
}

type PaymentInfo = {
  cardNumber: string
  expiry: string
  cvv: string
  cardName: string
}

type CustomerInfo = {
  name: string
  email: string
  phone: string
  address: string
  zone: string
  orderType: "delivery" | "pickup"
  specialInstructions: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Mansaf", description: "Slow-cooked lamb in jameed yogurt sauce served over fragrant rice with almonds and pine nuts", price: 24.99, category: "Mains", emoji: "🍖", popular: true },
  { id: "2", name: "Shawarma Plate", description: "Tender marinated chicken or beef shawarma with garlic sauce, pickles, and fresh pita", price: 16.99, category: "Mains", emoji: "🌯", popular: true },
  { id: "3", name: "Falafel Wrap", description: "Crispy golden falafel, tahini, tomatoes, cucumber in warm pita bread", price: 11.99, category: "Sandwiches", emoji: "🥙" },
  { id: "4", name: "Mixed Grill Platter", description: "Selection of kofta, shish tawook, and lamb chops served with grilled vegetables and rice", price: 28.99, category: "Mains", emoji: "🍢", popular: true },
  { id: "5", name: "Hummus", description: "Creamy house-made hummus with olive oil, paprika, and warm pita bread", price: 8.99, category: "Appetizers", emoji: "🫘" },
  { id: "6", name: "Fattoush Salad", description: "Fresh vegetables, crispy pita chips, sumac dressing", price: 9.99, category: "Salads", emoji: "🥗" },
  { id: "7", name: "Meze Platter", description: "Selection of hummus, baba ganoush, tabbouleh, falafel, and warm pita", price: 18.99, category: "Appetizers", emoji: "🫙", popular: true },
  { id: "8", name: "Musakhan", description: "Roasted chicken on taboon bread with caramelized onions and sumac", price: 19.99, category: "Mains", emoji: "🍗" },
  { id: "9", name: "Knafeh", description: "Traditional sweet cheese pastry with orange blossom syrup and pistachios", price: 7.99, category: "Desserts", emoji: "🍮" },
  { id: "10", name: "Baklava", description: "Layers of crispy phyllo, mixed nuts, and honey syrup", price: 5.99, category: "Desserts", emoji: "🍯" },
  { id: "11", name: "Laban Drink", description: "Refreshing yogurt drink with mint and salt", price: 3.99, category: "Drinks", emoji: "🥛" },
  { id: "12", name: "Jallab", description: "Traditional grape, rose water, and pomegranate juice with pine nuts", price: 4.99, category: "Drinks", emoji: "🍇" },
  { id: "13", name: "Tabbouleh", description: "Fresh parsley, bulgur wheat, tomatoes, mint, lemon and olive oil", price: 8.99, category: "Salads", emoji: "🌿" },
  { id: "14", name: "Baba Ganoush", description: "Smoky roasted eggplant dip with tahini, lemon, and olive oil", price: 8.99, category: "Appetizers", emoji: "🍆" },
  { id: "15", name: "Lamb Kofta", description: "Spiced ground lamb skewers with herbs, served with rice and salad", price: 21.99, category: "Mains", emoji: "🍡", spicy: true },
]

const DELIVERY_ZONES = [
  { id: "zone1", name: "Downtown (0-2 miles)", fee: 2.99, time: 25 },
  { id: "zone2", name: "Midtown (2-5 miles)", fee: 4.99, time: 35 },
  { id: "zone3", name: "Uptown (5-8 miles)", fee: 6.99, time: 45 },
  { id: "zone4", name: "Suburbs (8-12 miles)", fee: 8.99, time: 55 },
]

const CATEGORIES = ["All", "Mains", "Appetizers", "Sandwiches", "Salads", "Desserts", "Drinks"]

type View = "menu" | "cart" | "checkout" | "confirmation" | "kitchen"

export default function TasteOfAmman() {
  const [view, setView] = useState<View>("menu")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "", email: "", phone: "", address: "", zone: "zone1", orderType: "delivery", specialInstructions: ""
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "", expiry: "", cvv: "", cardName: ""
  })
  const [paymentErrors, setPaymentErrors] = useState<Partial<PaymentInfo>>({})
  const [customerErrors, setCustomerErrors] = useState<Partial<CustomerInfo>>({})

  useEffect(() => {
    const saved = localStorage.getItem("tasteofamman_orders")
    if (saved) {
      try { setOrders(JSON.parse(saved)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("tasteofamman_orders", JSON.stringify(orders))
    }
  }, [orders])

  const selectedZone = DELIVERY_ZONES.find(z => z.id === customerInfo.zone) || DELIVERY_ZONES[0]
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = customerInfo.orderType === "delivery" ? selectedZone.fee : 0
  const tax = subtotal * 0.08
  const total = subtotal + deliveryFee + tax

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id))
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) removeFromCart(id)
    else setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: qty } : c))
  }

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const validateCustomer = () => {
    const errors: Partial<CustomerInfo> = {}
    if (!customerInfo.name.trim()) errors.name = "Required"
    if (!customerInfo.email.trim() || !/\S+@\S+\.\S+/.test(customerInfo.email)) errors.email = "Valid email required"
    if (!customerInfo.phone.trim()) errors.phone = "Required"
    if (customerInfo.orderType === "delivery" && !customerInfo.address.trim()) errors.address = "Required for delivery"
    setCustomerErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePayment = () => {
    const errors: Partial<PaymentInfo> = {}
    const clean = paymentInfo.cardNumber.replace(/\s/g, "")
    if (!clean || clean.length < 16) errors.cardNumber = "Valid 16-digit card required"
    if (!paymentInfo.expiry || !/^\d{2}\/\d{2}$/.test(paymentInfo.expiry)) errors.expiry = "MM/YY required"
    if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) errors.cvv = "3-4 digits required"
    if (!paymentInfo.cardName.trim()) errors.cardName = "Required"
    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  const formatCard = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 16)
    return clean.replace(/(.{4})/g, "$1 ").trim()
  }

  const formatExpiry = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 4)
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2)
    return clean
  }

  const handlePlaceOrder = async () => {
    if (!validatePayment()) return
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 2500))

    const order: Order = {
      id: `TOA-${Date.now().toString().slice(-6)}`,
      items: [...cart],
      subtotal,
      deliveryFee,
      tax,
      total,
      status: "confirmed",
      timestamp: new Date().toISOString(),
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      address: customerInfo.address,
      orderType: customerInfo.orderType,
      paymentMethod: `**** **** **** ${paymentInfo.cardNumber.replace(/\s/g, "").slice(-4)}`,
      estimatedTime: customerInfo.orderType === "delivery" ? selectedZone.time : 20,
    }
    setCurrentOrder(order)
    setOrders(prev => [order, ...prev])
    setCart([])
    setIsProcessing(false)
    setView("confirmation")
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const statusColor = (status: Order["status"]) => {
    const map: Record<Order["status"], string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      preparing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      ready: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      delivering: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      delivered: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    }
    return map[status]
  }

  const nextStatus = (status: Order["status"]): Order["status"] | null => {
    const flow: Order["status"][] = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered"]
    const idx = flow.indexOf(status)
    return idx < flow.length - 1 ? flow[idx + 1] : null
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Hero / Header */}
      <header className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
                🌙
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Taste of Amman
                </h1>
                <p className="text-zinc-400 text-sm">Authentic Jordanian Cuisine • Est. 2010</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 flex-wrap">
              {(["menu", "kitchen"] as View[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setView(v); setCheckoutStep