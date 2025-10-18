import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '../store'
import type { FlowerSummary, RequestStatus } from '../types'

interface FlowersState {
  items: FlowerSummary[]
  status: RequestStatus
  error: string | null
  lastFetched: number | null
}

const initialState: FlowersState = {
  items: [],
  status: 'idle',
  error: null,
  lastFetched: null,
}

type FetchFlowersArg = { force?: boolean } | undefined

export const fetchFlowers = createAsyncThunk<FlowerSummary[], FetchFlowersArg, { state: RootState; rejectValue: string }>(
  'flowers/fetchAll',
  async (_arg, { signal, rejectWithValue }) => {
    try {
      const response = await fetch('/api/flowers', { signal })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Failed to fetch flowers: ${response.status}`)
      }
      const data = (await response.json()) as FlowerSummary[]
      return data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      const message = error instanceof Error ? error.message : 'Unknown error fetching flowers'
      return rejectWithValue(message)
    }
  },
  {
    condition: (arg, { getState }) => {
      const state = getState()
      if (arg?.force) return true
      if (state.flowers.status === 'loading') return false
      return state.flowers.items.length === 0
    },
  },
)

const flowersSlice = createSlice({
  name: 'flowers',
  initialState,
  reducers: {
    clearFlowers(state) {
      state.items = []
      state.status = 'idle'
      state.error = null
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlowers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFlowers.fulfilled, (state, action: PayloadAction<FlowerSummary[]>) => {
        state.items = action.payload
        state.status = 'succeeded'
        state.lastFetched = Date.now()
      })
      .addCase(fetchFlowers.rejected, (state, action) => {
        if (action.meta.aborted) return
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? null
      })
  },
})

export const { clearFlowers } = flowersSlice.actions
export const flowersReducer = flowersSlice.reducer

export const selectFlowers = (state: RootState) => state.flowers.items
export const selectFlowersStatus = (state: RootState) => state.flowers.status
export const selectFlowersError = (state: RootState) => state.flowers.error
