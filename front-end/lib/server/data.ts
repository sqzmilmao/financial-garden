import { randomUUID } from 'crypto'

export type ChatAuthor = 'assistant' | 'user'

export interface ChatEntry {
  id: string
  role: ChatAuthor
  content: string
  timestamp: string
}

export type FlowerCategory = 'travel' | 'education' | 'property' | 'car'

export interface FlowerRecord {
  id: string
  name: string
  description: string
  currentAmount: number
  targetAmount: number
  category: FlowerCategory
  createdAt: string
}

const flowers: FlowerRecord[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    description: 'A security cushion covering six months of expenses.',
    currentAmount: 4500,
    targetAmount: 10000,
    category: 'education',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Vacation',
    description: 'Dream trip to the Amalfi Coast.',
    currentAmount: 1600,
    targetAmount: 3000,
    category: 'travel',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'New Laptop',
    description: 'High-performance machine for creative work.',
    currentAmount: 2500,
    targetAmount: 2500,
    category: 'car',
    createdAt: new Date().toISOString(),
  },
]

const chatHistories: Record<string, ChatEntry[]> = {
  '1': [
    {
      id: randomUUID(),
      role: 'assistant',
      content: 'Welcome back! Your emergency fund is steadily growing.',
      timestamp: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      role: 'user',
      content: 'Thanks! Any tips to boost it faster?',
      timestamp: new Date().toISOString(),
    },
  ],
  '2': [
    {
      id: randomUUID(),
      role: 'assistant',
      content: 'Vacation savings are at a healthy pace. Keep it up!',
      timestamp: new Date().toISOString(),
    },
  ],
  '3': [
    {
      id: randomUUID(),
      role: 'assistant',
      content: 'A new laptop is within reach. Just a little more to go.',
      timestamp: new Date().toISOString(),
    },
  ],
}

export interface NotificationRecord {
  id: string
  title: string
  message: string
  coupon: string
  company: string
  category: FlowerCategory
  createdAt: string
  read: boolean
}

const notifications: NotificationRecord[] = [
  {
    id: 'coupon-3',
    title: 'Goal Completed!',
    message: "You’ve earned a coupon from Toyota Kazakhstan!",
    coupon: '5% off your next car with Toyota Kazakhstan',
    company: 'Toyota Kazakhstan',
    category: 'car',
    createdAt: new Date().toISOString(),
    read: false,
  },
]

export interface CouponRecord {
  id: string
  company: string
  description: string
  category: FlowerCategory
  createdAt: string
}

const coupons: CouponRecord[] = [
  {
    id: 'coupon-3',
    company: 'Toyota Kazakhstan',
    description: '5% off your next car with Toyota Kazakhstan',
    category: 'car',
    createdAt: new Date().toISOString(),
  },
]

const getProgress = (flower: FlowerRecord) =>
  flower.targetAmount > 0 ? flower.currentAmount / flower.targetAmount : 0

export const listFlowers = () =>
  flowers.map((flower) => ({
    ...flower,
    progress: getProgress(flower),
  }))

export const findFlower = (id: string) => flowers.find((flower) => flower.id === id)

export const getFlowerDetails = (id: string) => {
  const flower = findFlower(id)
  if (!flower) return null

  return {
    id: flower.id,
    name: flower.name,
    description: flower.description,
    goalProgress: getProgress(flower),
    category: flower.category,
    history: [...(chatHistories[id] ?? [])],
  }
}

export const addFlower = (input: {
  name: string
  description: string
  targetAmount: number
  category: FlowerCategory
}) => {
  const newFlower: FlowerRecord = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    currentAmount: 0,
    targetAmount: input.targetAmount,
    category: input.category,
    createdAt: new Date().toISOString(),
  }

  flowers.push(newFlower)
  chatHistories[newFlower.id] = [
    {
      id: randomUUID(),
      role: 'assistant',
      content: `Welcome! Let's start growing your ${newFlower.name} goal together.`,
      timestamp: new Date().toISOString(),
    },
  ]

  return {
    ...newFlower,
    progress: getProgress(newFlower),
  }
}

export const listChatHistory = (flowerId: string) => [...(chatHistories[flowerId] ?? [])]

export const appendChatMessages = (flowerId: string, messages: ChatEntry[]) => {
  const history = chatHistories[flowerId] ?? []
  history.push(...messages)
  chatHistories[flowerId] = history
  return [...history]
}

export const listNotifications = () => [...notifications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

export const addNotification = (entry: NotificationRecord) => {
  const existingIndex = notifications.findIndex((notification) => notification.id === entry.id)
  if (existingIndex !== -1) {
    notifications.splice(existingIndex, 1)
  }
  notifications.unshift(entry)
  const couponIndex = coupons.findIndex((coupon) => coupon.id === entry.id)
  if (couponIndex !== -1) {
    coupons.splice(couponIndex, 1)
  }
  coupons.unshift({
    id: entry.id,
    company: entry.company,
    description: entry.coupon,
    category: entry.category,
    createdAt: entry.createdAt,
  })
}

export const markNotificationRead = (id: string) => {
  const found = notifications.find((notification) => notification.id === id)
  if (found) {
    found.read = true
  }
  return found
}

export const listCoupons = () => [...coupons].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
