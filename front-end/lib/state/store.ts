import { configureStore } from '@reduxjs/toolkit'

import { chatReducer } from './slices/chatSlice'
import { flowerDetailsReducer } from './slices/flowerDetailsSlice'
import { flowersReducer } from './slices/flowersSlice'
import { notificationsReducer } from './slices/notificationsSlice'
import { strikeReducer } from './slices/strikeSlice'

export const makeStore = () =>
  configureStore({
    reducer: {
      flowers: flowersReducer,
      flowerDetails: flowerDetailsReducer,
      chat: chatReducer,
      notifications: notificationsReducer,
      strike: strikeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })

export const store = makeStore()

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
