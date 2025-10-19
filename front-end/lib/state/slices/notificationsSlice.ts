"use client"

import { createSlice, nanoid } from '@reduxjs/toolkit'

import type { NotificationEntry, RequestStatus } from '../types'
import type { RootState } from '../store'

export interface NotificationsState {
  items: NotificationEntry[]
  status: RequestStatus
}

const STORAGE_KEY = 'financial-garden-notifications'

const loadFromStorage = (): NotificationEntry[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as NotificationEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

const saveToStorage = (items: NotificationEntry[]) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore write errors
  }
}

const initialState: NotificationsState = {
  items: [],
  status: 'idle',
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    hydrateNotifications(state, action: { payload: NotificationEntry[] }) {
      state.items = action.payload
    },
    addNotification(
      state,
      action: {
        payload: Omit<NotificationEntry, 'id' | 'read' | 'createdAt'> & { id?: string; createdAt?: string; read?: boolean }
      },
    ) {
      const id = action.payload.id ?? nanoid()
      const createdAt = action.payload.createdAt ?? new Date().toISOString()
      const hasExisting = state.items.some((notification) => notification.id === id)
      if (hasExisting) return
      state.items.unshift({
        id,
        createdAt,
        read: Boolean(action.payload.read),
        title: action.payload.title,
        message: action.payload.message,
        coupon: action.payload.coupon,
        company: action.payload.company,
        category: action.payload.category,
      })
      saveToStorage(state.items)
    },
    markAsRead(state, action: { payload: string }) {
      const notification = state.items.find((item) => item.id === action.payload)
      if (notification) {
        notification.read = true
        saveToStorage(state.items)
      }
    },
    markAllAsRead(state) {
      state.items.forEach((item) => {
        item.read = true
      })
      saveToStorage(state.items)
    },
    clearNotifications(state) {
      state.items = []
      saveToStorage(state.items)
    },
  },
})

export const notificationsReducer = notificationsSlice.reducer
export const { hydrateNotifications, addNotification, markAsRead, markAllAsRead, clearNotifications } =
  notificationsSlice.actions

export const selectNotifications = (state: RootState) => state.notifications.items
export const selectUnreadCount = (state: RootState) =>
  state.notifications.items.reduce((count, notification) => (notification.read ? count : count + 1), 0)

export const selectRecentNotifications = (state: RootState, limit = 5) =>
  state.notifications.items.slice(0, limit ?? state.notifications.items.length)

export const loadNotificationsFromStorage = loadFromStorage

export const persistNotifications = saveToStorage
