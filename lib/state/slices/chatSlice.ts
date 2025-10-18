import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { fetchFlowerById } from './flowerDetailsSlice'
import type { RootState } from '../store'
import type { ChatMessage, RequestStatus } from '../types'

interface ChatState {
  messagesByFlowerId: Record<string, ChatMessage[]>
  statusByFlowerId: Record<string, RequestStatus>
  errorByFlowerId: Record<string, string | null>
}

const initialState: ChatState = {
  messagesByFlowerId: {},
  statusByFlowerId: {},
  errorByFlowerId: {},
}

interface SendMessageArgs {
  flowerId: string
  userMessage: string
}

interface SendMessageResponse {
  messages: ChatMessage[]
}

export const sendMessage = createAsyncThunk<
  SendMessageResponse,
  SendMessageArgs,
  { state: RootState; rejectValue: { message: string } }
>('chat/sendMessage', async ({ flowerId, userMessage }, { rejectWithValue, signal }) => {
  try {
    const response = await fetch('/api/assistant/chat', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flowerId, userMessage }),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `Failed to send message for flower ${flowerId}: ${response.status}`)
    }

    const data = (await response.json()) as SendMessageResponse
    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    const message = error instanceof Error ? error.message : 'Unknown error sending message'
    return rejectWithValue({ message })
  }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetChat(state, action: { payload?: string }) {
      const id = action.payload
      if (id) {
        delete state.messagesByFlowerId[id]
        delete state.statusByFlowerId[id]
        delete state.errorByFlowerId[id]
      } else {
        state.messagesByFlowerId = {}
        state.statusByFlowerId = {}
        state.errorByFlowerId = {}
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlowerById.fulfilled, (state, action) => {
        const details = action.payload
        state.messagesByFlowerId[details.id] = details.history
        state.statusByFlowerId[details.id] = 'succeeded'
        state.errorByFlowerId[details.id] = null
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { flowerId, userMessage } = action.meta.arg
        const requestId = action.meta.requestId
        const optimisticMessage: ChatMessage = {
          id: requestId,
          role: 'user',
          content: userMessage,
        }

        if (!state.messagesByFlowerId[flowerId]) {
          state.messagesByFlowerId[flowerId] = []
        }
        state.messagesByFlowerId[flowerId].push(optimisticMessage)
        state.statusByFlowerId[flowerId] = 'loading'
        state.errorByFlowerId[flowerId] = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { flowerId } = action.meta.arg
        state.messagesByFlowerId[flowerId] = action.payload.messages
        state.statusByFlowerId[flowerId] = 'succeeded'
      })
      .addCase(sendMessage.rejected, (state, action) => {
        if (action.meta.aborted) return
        const { flowerId } = action.meta.arg
        const requestId = action.meta.requestId
        const messages = state.messagesByFlowerId[flowerId]
        if (messages) {
          state.messagesByFlowerId[flowerId] = messages.filter((message) => message.id !== requestId)
        }
        state.statusByFlowerId[flowerId] = 'failed'
        state.errorByFlowerId[flowerId] = action.payload?.message ?? action.error.message ?? null
      })
  },
})

export const { resetChat } = chatSlice.actions
export const chatReducer = chatSlice.reducer

export const selectChatMessages = (state: RootState, flowerId: string) => state.chat.messagesByFlowerId[flowerId] ?? []
export const selectChatStatus = (state: RootState, flowerId: string): RequestStatus =>
  state.chat.statusByFlowerId[flowerId] ?? 'idle'
export const selectChatError = (state: RootState, flowerId: string) => state.chat.errorByFlowerId[flowerId] ?? null
