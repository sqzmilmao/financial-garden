"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BarChart3, Loader2, MessageCircle, RefreshCcw } from "lucide-react"

import { AddFlowerModal } from "@/components/add-flower-modal"
import { ChatPanel } from "@/components/chat-panel"
import { EmptyPot } from "@/components/empty-pot"
import { FlowerCard } from "@/components/flower-card"
import { GoalModal } from "@/components/goal-modal"
import { SadaqaStrikeButton } from "@/components/sadaqa-strike-button"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { getFlowerColor } from "@/lib/growth-stages"
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks"
import { useFlowers } from "@/lib/hooks/useFlowers"
import {
  addNotification as addNotificationAction,
  markAllAsRead,
  selectNotifications,
  selectRecentNotifications,
  selectUnreadCount,
} from "@/lib/state/slices/notificationsSlice"

// ✅ добавили этот импорт
import { fetchFlowerById } from "@/lib/state/slices/flowerDetailsSlice"

const MAX_SLOTS = 8

const COUPON_OFFERS: Record<
  "travel" | "education" | "property" | "car",
  Array<{ company: string; description: string }>
> = {
  travel: [
    { company: "Air Astana", description: "10% discount on your next flight" },
    { company: "Qazaq Air", description: "Complimentary lounge access on your next trip" },
  ],
  education: [
    { company: "Nazarbayev University", description: "Free access to NU Library resources" },
    { company: "Coursera", description: "Voucher for a professional development course" },
  ],
  property: [
    { company: "BI Group", description: "5% discount on a new apartment purchase" },
    { company: "Katon Real Estate", description: "Free consultation with a property advisor" },
  ],
  car: [
    { company: "Chevrolet", description: "Discount on the new Cobalt model" },
    { company: "Toyota Kazakhstan", description: "5% off your next car with Toyota Kazakhstan" },
  ],
}

export default function FinancialGarden() {
  const { flowers, status, error, refetch, createFlower } = useFlowers()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)
  const recentNotifications = useAppSelector((state) => selectRecentNotifications(state, 5))

  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const selectedAccent = useMemo(() => {
    if (!selectedFlowerId) return null
    const index = flowers.findIndex((flower) => flower.id === selectedFlowerId)
    return index >= 0 ? getFlowerColor(index) : null
  }, [flowers, selectedFlowerId])

  const isInitialLoad = flowers.length === 0
  const isLoading = status === "loading" && isInitialLoad
  const hasError = status === "failed" && isInitialLoad

  const slots = useMemo(
    () => Array.from({ length: MAX_SLOTS }, (_, idx) => flowers[idx] ?? null),
    [flowers],
  )

  // ✅ фикс — теперь при клике делается реальный fetch к бэку
  const openFlowerDetails = (flowerId: string) => {
    setSelectedFlowerId(flowerId)
    setIsDetailOpen(true)

    // Немедленно загружаем детали цветка с Go-бэка
    dispatch(fetchFlowerById({ id: flowerId, force: true }))
    console.log("🔍 Fetching flower details for:", flowerId)
  }

  const openChat = () => {
    if (!selectedFlowerId && flowers.length > 0) {
      setSelectedFlowerId(flowers[0].id)
    }
    setIsChatOpen(true)
  }

  const openAddModal = () => {
    setCreateError(null)
    setIsAddModalOpen(true)
  }

  const handleCreateFlower = async (data: {
    name: string
    description: string
    targetAmount: number
    category: "travel" | "education" | "property" | "car"
  }) => {
    try {
      setIsCreating(true)
      setCreateError(null)
      const created = await createFlower(data)
      setIsAddModalOpen(false)
      if (created?.id) {
        setSelectedFlowerId(created.id)
        setIsDetailOpen(true)
        dispatch(fetchFlowerById({ id: created.id, force: true })) // сразу же подгружаем новые данные
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create flower."
      setCreateError(message)
    } finally {
      setIsCreating(false)
    }
  }

  // Проверяем завершённые цели → создаём купоны
  useEffect(() => {
    if (flowers.length === 0) return

    flowers.forEach((flower) => {
      if (flower.progress < 1) return

      const notificationId = `coupon-${flower.id}`
      const alreadyNotified = notifications.some((n) => n.id === notificationId)
      if (alreadyNotified) return

      const offers = COUPON_OFFERS[flower.category] ?? []
      const offer =
        offers[Math.floor(Math.random() * offers.length)] ?? {
          company: "Garden Rewards",
          description: "Exclusive thank-you gift",
        }

      const payload = {
        id: notificationId,
        title: "Goal Completed!",
        message: `You’ve earned a coupon from ${offer.company}!`,
        coupon: offer.description,
        company: offer.company,
        category: flower.category,
        createdAt: new Date().toISOString(),
        read: false,
      } as const

      dispatch(addNotificationAction(payload))

      void apiFetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {
        // mock backend
      })
    })
  }, [dispatch, flowers, notifications])

  useEffect(() => {
    if (isNotificationsOpen) {
      dispatch(markAllAsRead())
    }
  }, [dispatch, isNotificationsOpen])

  return (
    <div className="garden-background min-h-screen">
      <nav className="sticky top-0 z-40 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ color: "#2D9A86" }}>
            Financial Garden
          </h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={openChat} className="bg-white">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Link href="/charts">
              <Button variant="outline" className="bg-white">
                <BarChart3 className="mr-2 h-4 w-4" />
                Charts
              </Button>
            </Link>
            <SadaqaStrikeButton />
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative rounded-full p-2 text-2xl text-gray-700 transition-colors hover:text-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                aria-label="View notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-teal-500 px-1 text-xs font-semibold text-white">
                    {Math.min(unreadCount, 9)}
                    {unreadCount > 9 ? "+" : ""}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Recent rewards</h3>
                    {recentNotifications.length > 0 && (
                      <span className="text-xs text-slate-400">
                        Last update {new Date(recentNotifications[0]?.createdAt ?? Date.now()).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-3">
                    {recentNotifications.length === 0 ? (
                      <p className="text-sm text-slate-500">No coupons yet. Keep growing your flowers!</p>
                    ) : (
                      recentNotifications.map((notification) => (
                        <div key={notification.id} className="rounded-lg bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                          <p className="text-xs text-slate-500">{notification.message}</p>
                          <p className="mt-2 text-xs text-teal-600">{notification.company}</p>
                          <p className="text-xs text-slate-400">{notification.coupon}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href="/coupons"
                    className="mt-4 inline-block text-sm font-semibold text-teal-600 transition-colors hover:text-teal-500"
                    onClick={() => setIsNotificationsOpen(false)}
                  >
                    View All Coupons →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">Your Financial Garden</h2>
          <p className="text-gray-600">Track the growth of each savings goal in real time.</p>
        </div>

        {isLoading && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading your flowers...</p>
          </div>
        )}

        {hasError && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center text-gray-700">
            <p>We couldn’t load your financial garden right now.</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !hasError && (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {slots.map((flower, index) =>
              flower ? (
                <FlowerCard key={flower.id} flower={flower} index={index} onClick={() => openFlowerDetails(flower.id)} />
              ) : (
                <div key={`empty-${index}`} className="flex items-end justify-center">
                  <EmptyPot onClick={openAddModal} />
                </div>
              ),
            )}
          </div>
        )}
      </div>

      <GoalModal
        flowerId={selectedFlowerId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        accentColor={selectedAccent ?? undefined}
      />

      <AddFlowerModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateFlower}
        loading={isCreating}
        error={createError}
      />

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} flowerId={selectedFlowerId} />
    </div>
  )
}
