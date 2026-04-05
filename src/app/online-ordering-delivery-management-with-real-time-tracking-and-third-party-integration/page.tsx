"use client"

import { useState, useEffect, useCallback } from "react"

type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
type DeliveryProvider = "in-house" | "uber-eats" | "doordash" | "talabat"

interface MenuItem {
  id: string
  name: string
  nameAr: string
  category: string
  price: number
  description: string
  image: string
  popular: boolean
  available: boolean
}

interface CartItem extends MenuItem {
  quantity: number
  notes: string
}

interface Order {
  id: string
  items: CartItem[]
  status: OrderStatus
  customer: string
  address: string
  phone: string
  provider: DeliveryProvider
  total: number
  estimatedTime: number
  createdAt: Date
  driverName?: string
  driverPhone?: string
  driverLocation?: { lat: number; lng: number }
  trackingCode?: string
}

const menuItems: MenuItem[] = [
  { id: "1", name: "Mansaf", nameAr: "منسف", category: "Main", price: 22, description: "Traditional Jordanian lamb with jameed sauce over rice", image: "🍖", popular: true, available: true },
  { id: "2", name: "Shawarma Plate", nameAr: "شاورما", category: "Main", price: 16, description: "Marinated chicken or beef with pita and garlic sauce", image: "🌯", popular: true, available: true },
  { id: "3", name: "Falafel Wrap", nameAr: "فلافل", category: "Sandwiches", price: 8, description: "Crispy falafel with fresh vegetables in pita bread", image: "🧆", popular: true, available: true },
  { id: "4", name: "Hummus", nameAr: "حمص", category: "Starters", price: 7, description: "Creamy chickpea dip with olive oil and paprika", image: "🫘", popular: true, available: true },
  { id: "5", name: "Musakhan", nameAr: "مسخن", category: "Main", price: 19, description: "Roasted chicken with caramelized onions on taboon bread", image: "🍗", popular: false, available: true },
  { id: "6", name: "Maqluba", nameAr: "مقلوبة", category: "Main", price: 20, description: "Inverted rice dish with vegetables and meat", image: "🍚", popular: false, available: true },
  { id: "7", name: "Fattoush", nameAr: "فتوش", category: "Salads", price: 9, description: "Fresh salad with crispy bread, sumac dressing", image: "🥗", popular: false, available: true },
  { id: "8", name: "Knafeh", nameAr: "كنافة", category: "Desserts", price: 8, description: "Sweet cheese pastry soaked in sugar syrup", image: "🍮", popular: true, available: true },
  { id: "9", name: "Qatayef", nameAr: "قطايف", category: "Desserts", price: 7, description: "Stuffed pancakes with cream or walnut filling", image: "🥞", popular: false, available: false },
  { id: "10", name: "Jallab", nameAr: "جلاب", category: "Drinks", price: 4, description: "Rose water, grape juice, and raisins drink", image: "🍹", popular: true, available: true },
]

const categories = ["All", "Main", "Starters", "Sandwiches", "Salads", "Desserts", "Drinks"]

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: string; step: number }> = {
  pending: { label: "Pending", color: "text-yellow-400", icon: "⏳", step: 0 },
  confirmed: { label: "Confirmed", color: "text-blue-400", icon: "✅", step: 1 },
  preparing: { label: "Preparing", color: "text-orange-400", icon: "👨‍🍳", step: 2 },
  out_for_delivery: { label: "On The Way", color: "text-purple-400", icon: "🛵", step: 3 },
  delivered: { label: "Delivered", color: "text-green-400", icon: "🎉", step: 4 },
  cancelled: { label: "Cancelled", color: "text-red-400", icon: "❌", step: -1 },
}

const providerConfig: Record<DeliveryProvider, { label: string; color: string; logo: string }> = {
  "in-house": { label: "In-House", color: "bg-amber-600", logo: "🏠" },
  "uber-eats": { label: "Uber Eats", color: "bg-green-700", logo: "🚗" },
  doordash: { label: "DoorDash", color: "bg-red-700", logo: "🔴" },
  talabat: { label: "Talabat", color: "bg-orange-600", logo: "🛍️" },
}

function generateOrderId(): string {
  return "TOA-" + Math.random().toString(36).substr(2, 6).toUpperCase()
}

function generateTrackingCode(): string {
  return Math.random().toString(36).substr(2, 10).toUpperCase()
}

const mockDrivers = [
  { name: "Ahmad Hassan", phone: "+962-77-123-4567" },
  { name: "Mohammed Ali", phone: "+962-79-234-5678" },
  { name: "Khalid Omar", phone: "+962-78-345-6789" },
]

export default function TasteOfAmmanOrderingSystem() {
  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "tracking" | "integrations">("menu")
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [trackingInput, setTrackingInput] = useState("")
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    provider: "in-house" as DeliveryProvider,
    paymentMethod: "cash",
    notes: "",
  })

  const showNotification = useCallback((msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  useEffect(() => {
    const initialOrders: Order[] = [
      {
        id: "TOA-ABC123",
        items: [
          { ...menuItems[0], quantity: 2, notes: "" },
          { ...menuItems[3], quantity: 1, notes: "Extra olive oil" },
        ],
        status: "out_for_delivery",
        customer: "Sarah Johnson",
        address: "123 Rainbow Street, Amman 11181",
        phone: "+962-77-555-0101",
        provider: "in-house",
        total: 51,
        estimatedTime: 15,
        createdAt: new Date(Date.now() - 30 * 60000),
        driverName: "Ahmad Hassan",
        driverPhone: "+962-77-123-4567",
        driverLocation: { lat: 31.9539, lng: 35.9106 },
        trackingCode: "TOA-TRACK-XY",
      },
      {
        id: "TOA-DEF456",
        items: [{ ...menuItems[1], quantity: 1, notes: "No garlic" }],
        status: "preparing",
        customer: "Omar Khalil",
        address: "45 Zahran Street, Amman 11195",
        phone: "+962-79-555-0202",
        provider: "uber-eats",
        total: 16,
        estimatedTime: 25,
        createdAt: new Date(Date.now() - 10 * 60000),
        trackingCode: "TOA-TRACK-AB",
      },
      {
        id: "TOA-GHI789",
        items: [
          { ...menuItems[2], quantity: 3, notes: "" },
          { ...menuItems[9], quantity: 3, notes: "" },
        ],
        status: "delivered",
        customer: "Rania Taweel",
        address: "8 University Street, Amman",
        phone: "+962-78-555-0303",
        provider: "doordash",
        total: 36,
        estimatedTime: 0,
        createdAt: new Date(Date.now() - 90 * 60000),
        trackingCode: "TOA-TRACK-CD",
      },
    ]
    setOrders(initialOrders)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev =>
        prev.map(order => {
          if (order.status === "out_for_delivery" && order.driverLocation) {
            return {
              ...order,
              driverLocation: {
                lat: order.driverLocation.lat + (Math.random() - 0.5) * 0.001,
                lng: order.driverLocation.lng + (Math.random() - 0.5) * 0.001,
              },
              estimatedTime: Math.max(0, order.estimatedTime - 1),
            }
          }
          return order
        })
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredItems = menuItems.filter(
    item => selectedCategory === "All" || item.category === selectedCategory
  )

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (item: MenuItem) => {
    if (!item.available) return
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1, notes: "" }]
    })
    showNotification(`${item.name} added to cart!`)
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  const placeOrder = () => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      showNotification("Please fill all required fields")
      return
    }
    const driver = checkoutForm.provider === "in-house" ? mockDrivers[Math.floor(Math.random() * mockDrivers.length)] : undefined
    const newOrder: Order = {
      id: generateOrderId(),
      items: [...cart],
      status: "pending",
      customer: checkoutForm.name,
      address: checkoutForm.address,
      phone: checkoutForm.phone,
      provider: checkoutForm.provider,
      total: cartTotal + 2.5,
      estimatedTime: 35,
      createdAt: new Date(),
      driverName: driver?.name,
      driverPhone: driver?.phone,
      driverLocation: checkoutForm.provider === "in-house" ? { lat: 31.9539, lng: 35.9106 } : undefined,
      trackingCode: generateTrackingCode(),
    }
    setOrders(prev => [newOrder, ...prev])
    setCart([])
    setShowCheckout(false)
    setShowCart(false)
    setActiveTab("orders")
    showNotification(`Order ${newOrder.id} placed successfully!`)

    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: "confirmed" } : o))
    }, 3000)
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: "preparing" } : o))
    }, 8000)
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o
      const updates: Partial<Order> = { status }
      if (status === "out_for_delivery" && !o.driverName && o.provider === "in-house") {
        const driver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)]
        updates.driverName = driver.name
        updates.driverPhone = driver.phone
        updates.driverLocation = { lat: 31.9539, lng: 35.9106 }
      }
      return { ...o, ...updates }
    }))
    showNotification(`Order status updated to ${statusConfig[status].label}`)
  }

  const handleTrackOrder = () => {
    const found = orders.find(o => o.id === trackingInput || o.trackingCode === trackingInput)
    if (found) {
      setTrackedOrder(found)
    } else {
      showNotification("Order not found. Please check your tracking code.")
    }
  }

  const integrationStats = {
    uberEats: { orders: 47, revenue: 823, rating: 4.7 },
    doordash: { orders: 31, revenue: 541, rating: 4.5 },
    talabat: { orders: 89, revenue: 1560, rating: 4.8 },
    inHouse: { orders: 134, revenue: 2890, rating: 4.9 },
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-amber-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-pulse">
          <span>🔔</span>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-xl">🌿</div>
            <div>
              <h1 className="text-lg font-bold text-amber-400">Taste of Amman</h1>
              <p className="