"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, RefreshCcw, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getGrowthStage } from "@/lib/growth-stages"
import { useChat } from "@/lib/hooks/useChat"
import { useFlowerDetails } from "@/lib/hooks/useFlowerDetails"

interface GoalModalProps {
  flowerId: string | null
  isOpen: boolean
  onClose: () => void
  accentColor?: string
}

export function GoalModal({ flowerId, isOpen, onClose, accentColor }: GoalModalProps) {
  const { data, status, error, refetch } = useFlowerDetails(flowerId)
  const { messages, status: chatStatus, error: chatError, sendMessage } = useChat(flowerId)

  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Очистка поля при смене цветка
  useEffect(() => {
    setChatInput("")
  }, [flowerId])

  // Автоподгрузка при открытии модалки
  useEffect(() => {
    if (isOpen && flowerId) refetch()
  }, [isOpen, flowerId, refetch])

  // Автопрокрутка вниз при обновлении сообщений
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const progressPercent = Math.round((data?.goalProgress ?? 0) * 100)
  const stage = useMemo(() => getGrowthStage(progressPercent), [progressPercent])
  const color = accentColor ?? "#2D9A86"

  const isLoading = status === "loading" && !data
  const hasError = status === "failed" && !data

  const handleSend = () => {
    if (!chatInput.trim()) return
    sendMessage(chatInput)
    setChatInput("")
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          className="relative w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close goal modal"
          >
            <X className="h-6 w-6" />
          </button>

          {/* === Загрузка === */}
          {isLoading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Loading flower details...</p>
            </div>
          ) : hasError ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-center text-gray-700">
              <p>We couldn’t load the details for this flower.</p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={() => refetch()} variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          ) : (
            data && (
              <div className="flex max-h-[80vh] flex-col gap-6 lg:flex-row">
                {/* === Левая часть (инфо о цветке) === */}
                <div className="flex-[2] space-y-6 overflow-y-auto pr-2">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="mb-4 text-8xl"
                      style={{ filter: `drop-shadow(0 0 16px ${color}60)` }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      {stage.emoji}
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-800">{data.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">{data.description}</p>
                    <span className="mt-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-600">
                      {data.category}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold" style={{ color }}>
                        {progressPercent}%
                      </span>
                    </div>
                    <Progress
                      value={progressPercent}
                      className="h-3"
                      style={{ ["--progress-background" as string]: color }}
                    />
                    <p className="text-xs text-gray-500">{stage.description}</p>
                  </div>
                </div>

                {/* === Правая часть (чат) === */}
                <div className="flex flex-[3] flex-col rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-700">Assistant Chat</h3>
                    {chatStatus === "loading" && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Sending…
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-sm text-gray-500">
                        No messages yet. Say hello to your assistant!
                      </p>
                    ) : (
                      messages.map((message, idx) => (
                        <div
                          key={`${message.id ?? idx}-${idx}`}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                              message.role === "user"
                                ? "bg-[#2D9A86] text-white"
                                : "bg-white text-gray-800 shadow-sm"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {chatError && <p className="px-4 text-xs text-red-500">{chatError}</p>}

                  <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        placeholder="Ask the assistant about this flower..."
                        className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#2D9A86]"
                      />
                      <Button
                        onClick={handleSend}
                        style={{ backgroundColor: "#2D9A86" }}
                        className="rounded-full px-4 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
