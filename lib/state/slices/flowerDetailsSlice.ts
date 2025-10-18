import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '../store'
import type { FlowerDetails, RequestStatus } from '../types'

interface FlowerDetailsState {
  entities: Record<string, FlowerDetails>
  statusById: Record<string, RequestStatus>
  errorById: Record<string, string | null>
}

const initialState: FlowerDetailsState = {
  entities: {},
  statusById: {},
  errorById: {},
}

type FetchFlowerByIdArg = {
  id: string
  force?: boolean
}

export const fetchFlowerById = createAsyncThunk<
  FlowerDetails,
  FetchFlowerByIdArg,
  { state: RootState; rejectValue: { id: string; message: string } }
>(
  'flowerDetails/fetchById',
  async ({ id }, { signal, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/flowers/${id}`, { signal })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Failed to fetch flower ${id}: ${response.status}`)
      }
      const data = (await response.json()) as FlowerDetails
      return data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      const message = error instanceof Error ? error.message : 'Unknown error fetching flower'
      return rejectWithValue({ id, message })
    }
  },
  {
    condition: ({ id, force }, { getState }) => {
      if (force) return true
      const state = getState()
      if (state.flowerDetails.statusById[id] === 'loading') return false
      return !state.flowerDetails.entities[id]
    },
  },
)

const flowerDetailsSlice = createSlice({
  name: 'flowerDetails',
  initialState,
  reducers: {
    clearFlowerDetails(state, action: { payload?: string }) {
      const id = action.payload
      if (id) {
        delete state.entities[id]
        delete state.statusById[id]
        delete state.errorById[id]
      } else {
        state.entities = {}
        state.statusById = {}
        state.errorById = {}
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlowerById.pending, (state, action) => {
        const { id } = action.meta.arg
        state.statusById[id] = 'loading'
        state.errorById[id] = null
      })
      .addCase(fetchFlowerById.fulfilled, (state, action) => {
        const flower = action.payload
        state.entities[flower.id] = flower
        state.statusById[flower.id] = 'succeeded'
        state.errorById[flower.id] = null
      })
      .addCase(fetchFlowerById.rejected, (state, action) => {
        if (action.meta.aborted) return
        const id = action.meta.arg.id
        state.statusById[id] = 'failed'
        state.errorById[id] = action.payload?.message ?? action.error.message ?? null
      })
  },
})

export const { clearFlowerDetails } = flowerDetailsSlice.actions
export const flowerDetailsReducer = flowerDetailsSlice.reducer

export const selectFlowerDetails = (state: RootState, id: string) => state.flowerDetails.entities[id]
export const selectFlowerDetailsStatus = (state: RootState, id: string): RequestStatus =>
  state.flowerDetails.statusById[id] ?? 'idle'
export const selectFlowerDetailsError = (state: RootState, id: string) => state.flowerDetails.errorById[id] ?? null
