import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/lib/state/hooks'
import { selectChatError, selectChatMessages, selectChatStatus, sendMessage } from '@/lib/state/slices/chatSlice'

export const useChat = (flowerId: string | null | undefined) => {
  const dispatch = useAppDispatch()

  const messages = useAppSelector((state) => (flowerId ? selectChatMessages(state, flowerId) : []))
  const status = useAppSelector((state) => (flowerId ? selectChatStatus(state, flowerId) : 'idle'))
  const error = useAppSelector((state) => (flowerId ? selectChatError(state, flowerId) : null))

  const submitMessage = useCallback(
    (userMessage: string) => {
      if (!flowerId || !userMessage.trim()) return
      void dispatch(sendMessage({ flowerId, userMessage: userMessage.trim() }))
    },
    [dispatch, flowerId],
  )

  return {
    messages,
    status,
    error,
    sendMessage: submitMessage,
  }
}
