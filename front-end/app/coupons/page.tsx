"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { apiFetch } from "@/lib/api"
import { useAppSelector } from "@/lib/state/hooks"
import { selectNotifications } from "@/lib/state/slices/notificationsSlice"
import type { FlowerCategory } from "@/lib/state/types"

interface CouponItem {
  id: string
  company: string
  description: string
  category: FlowerCategory
  createdAt: string
}

export default function CouponsPage() {
  const notifications = useAppSelector(selectNotifications)
  const [coupons, setCoupons] = useState<CouponItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const normalizedNotifications = useMemo<CouponItem[]>(() => {
    return notifications.map((notification) => ({
      id: notification.id,
      company: notification.company,
      description: notification.coupon,
      category: notification.category,
      createdAt: notification.createdAt,
    }))
  }, [notifications])

  useEffect(() => {
    const loadFromApi = async () => {
      try {
        const response = await apiFetch("/api/coupons")
        if (!response.ok) {
          throw new Error("Failed to fetch coupons")
        }
        const data = (await response.json()) as CouponItem[]
        setCoupons(data)
      } catch {
        setCoupons(normalizedNotifications)
      } finally {
        setIsLoading(false)
      }
    }

    void loadFromApi()
  }, [normalizedNotifications])

  useEffect(() => {
    if (!isLoading) {
      setCoupons((prev) => {
        const merged = new Map<string, CouponItem>()
        const source = [...normalizedNotifications, ...prev]
        source.forEach((coupon) => {
          merged.set(coupon.id, coupon)
        })
        return Array.from(merged.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      })
    }
  }, [isLoading, normalizedNotifications])

  return (
    <div className="garden-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Your Coupons</h1>
            <p className="mt-2 text-sm text-slate-600">
              Every completed flower goal blossoms into a new reward from our partners.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-teal-400 px-4 py-2 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50"
          >
            Back to Garden
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-12 flex min-h-[40vh] flex-col items-center justify-center gap-2 text-slate-600">
            <span className="text-sm">Gathering your rewards...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-teal-200 bg-white/80 p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">No coupons yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Complete a flower goal to unlock your first reward.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-md">
                <h2 className="text-lg font-semibold text-slate-800">{coupon.company}</h2>
                <p className="mt-2 text-sm text-slate-600">{coupon.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="uppercase tracking-wide">{coupon.category}</span>
                  <span>{new Date(coupon.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
