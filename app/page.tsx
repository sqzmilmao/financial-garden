"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BarChart3, Loader2, MessageCircle, RefreshCcw } from "lucide-react"

import { ChatPanel } from "@/components/chat-panel"
import { FlowerCard } from "@/components/flower-card"
import { GoalModal } from "@/components/goal-modal"
import { Button } from "@/components/ui/button"
import { getFlowerColor } from "@/lib/growth-stages"
import { useFlowers } from "@/lib/hooks/useFlowers"

export default function FinancialGarden() {
  const { flowers, status, error, refetch } = useFlowers()
  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const selectedAccent = useMemo(() => {
    if (!selectedFlowerId) return null
    const index = flowers.findIndex((flower) => flower.id === selectedFlowerId)
    return index >= 0 ? getFlowerColor(index) : null
  }, [flowers, selectedFlowerId])

  const isLoading = status === "loading"
  const hasError = status === "failed"

  const handleSelectFlower = (flowerId: string) => {
    setSelectedFlowerId(flowerId)
    setIsModalOpen(true)
  }

  const handleOpenChat = () => {
    if (!selectedFlowerId && flowers.length > 0) {
      setSelectedFlowerId(flowers[0].id)
    }
    setIsChatOpen(true)
  }

  return (
    <div className="garden-background min-h-screen">
      <nav className="sticky top-0 z-40 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ color: "#2D9A86" }}>
            Financial Garden
          </h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleOpenChat} className="bg-white">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Link href="/charts">
              <Button variant="outline" className="bg-white">
                <BarChart3 className="mr-2 h-4 w-4" />
                Charts
              </Button>
            </Link>
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
            <p>We couldn&rsquo;t load your financial garden right now.</p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !hasError && flowers.length === 0 && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center text-gray-600">
            <p>No flowers yet. Create a goal in the backend to see it blossom here.</p>
          </div>
        )}

        {!isLoading && !hasError && flowers.length > 0 && (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {flowers.map((flower, index) => (
              <FlowerCard key={flower.id} flower={flower} index={index} onClick={() => handleSelectFlower(flower.id)} />
            ))}
          </div>
        )}
      </div>

      <GoalModal
        flowerId={selectedFlowerId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accentColor={selectedAccent ?? undefined}
      />

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} flowerId={selectedFlowerId} />
    </div>
  )
}
