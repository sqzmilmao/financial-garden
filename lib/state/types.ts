export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface FlowerSummary {
  id: string
  name: string
  progress: number
}

export interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
  id?: string
  timestamp?: string
}

export interface FlowerDetails {
  id: string
  name: string
  description: string
  goalProgress: number
  history: ChatMessage[]
}
