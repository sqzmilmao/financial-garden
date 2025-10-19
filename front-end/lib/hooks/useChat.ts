import { useCallback, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks"
import {
  fetchChatHistory,
  selectChatError,
  selectChatMessages,
  selectChatStatus,
  sendMessage,
} from "@/lib/state/slices/chatSlice"

export const useChat = (flowerId: string | null | undefined) => {
  const dispatch = useAppDispatch()

  // ✅ создаём новый массив, чтобы React понял, что state изменился
  const messages = useAppSelector((state) =>
    flowerId ? [...selectChatMessages(state, flowerId)] : []
  )

  const status = useAppSelector((state) =>
    flowerId ? selectChatStatus(state, flowerId) : "idle"
  )

  const error = useAppSelector((state) =>
    flowerId ? selectChatError(state, flowerId) : null
  )

  useEffect(() => {
    if (flowerId && status === "idle") {
      dispatch(fetchChatHistory(flowerId))
    }
  }, [dispatch, flowerId, status])

  const refetch = useCallback(() => {
    if (flowerId) {
      dispatch(fetchChatHistory(flowerId))
    }
  }, [dispatch, flowerId])

  const submitMessage = useCallback(
    (userMessage: string) => {
      if (!flowerId || !userMessage.trim()) return
      void dispatch(sendMessage({ flowerId, userMessage: userMessage.trim() }))
    },
    [dispatch, flowerId]
  )

  return {
    messages,
    status,
    error,
    sendMessage: submitMessage,
    refetch,
  }
}
