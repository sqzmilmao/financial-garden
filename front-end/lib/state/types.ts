export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type FlowerCategory = 'travel' | 'education' | 'property' | 'car'

export interface FlowerSummary {
  id: string
  name: string
  description: string
  currentAmount: number
  targetAmount: number
  progress: number
  category: FlowerCategory
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
  category: FlowerCategory
  goalProgress: number
  history: ChatMessage[]
}

export interface NotificationEntry {
  id: string
  title: string
  message: string
  coupon: string
  company: string
  category: FlowerCategory
  createdAt: string
  read: boolean
}

export interface StrikeFund {
  id: string
  name: string
  paid: boolean
}
