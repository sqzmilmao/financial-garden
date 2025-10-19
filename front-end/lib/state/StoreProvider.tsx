'use client'

import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'

import { apiFetch } from '@/lib/api'
import { hydrateNotifications, loadNotificationsFromStorage } from './slices/notificationsSlice'
import { makeStore, type AppStore } from './store'

type StoreProviderProps = {
  children: React.ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore>()
  if (!storeRef.current) {
    const store = makeStore()
    const cachedNotifications = loadNotificationsFromStorage()
    if (cachedNotifications.length > 0) {
      store.dispatch(hydrateNotifications(cachedNotifications))
    }
    storeRef.current = store
  }

  useEffect(() => {
    const store = storeRef.current
    if (!store) return
    const load = async () => {
      try {
        const response = await apiFetch('/api/notifications')
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          store.dispatch(hydrateNotifications(data))
        }
      } catch {
        // ignore fetch errors
      }
    }
    void load()
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
