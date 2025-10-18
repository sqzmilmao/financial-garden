"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useChat } from "@/lib/hooks/useChat"

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  flowerId: string | null
}

export function ChatPanel({ isOpen, onClose, flowerId }: ChatPanelProps) {
  const { messages, status, error, sendMessage } = useChat(flowerId)
  const [input, setInput] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInput("")
  }, [flowerId, isOpen])

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput("")
  }

  const disabled = !flowerId

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col bg-white shadow-2xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="flex items-center justify-between border-b p-4" style={{ backgroundColor: "#2D9A86" }}>
            <h2 className="text-lg font-semibold text-white">Financial Assistant</h2>
            <button onClick={onClose} className="text-white hover:opacity-80">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {disabled && <p className="text-sm text-gray-500">Select a flower to start chatting with the assistant.</p>}
            {!disabled &&
              messages.map((message, idx) => (
                <div key={`${message.id ?? idx}-${idx}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      message.role === "user" ? "bg-[#2D9A86] text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
          </div>

          {!disabled && error && <p className="px-4 text-xs text-red-500">{error}</p>}

          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={disabled ? "Choose a flower to start chatting" : "Ask me anything..."}
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#2D9A86]"
                disabled={disabled}
              />
              <Button
                onClick={handleSend}
                style={{ backgroundColor: "#2D9A86" }}
                className="flex items-center justify-center gap-1 rounded-full px-4 text-white"
                disabled={disabled || status === "loading"}
              >
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
