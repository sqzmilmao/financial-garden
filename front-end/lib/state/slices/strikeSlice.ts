import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '../store'
import type { StrikeFund } from '../types'

interface StrikeState {
  funds: StrikeFund[]
  strikeCount: number
  lastStrikeDate: string | null
}

const initialFunds: StrikeFund[] = [
  { id: 'fund-1', name: 'Community Water Well', paid: false },
  { id: 'fund-2', name: 'Neighborhood School Supplies', paid: false },
  { id: 'fund-3', name: 'Local Food Pantry', paid: false },
  { id: 'fund-4', name: 'Refugee Assistance Fund', paid: false },
]

const initialState: StrikeState = {
  funds: initialFunds,
  strikeCount: 4,
  lastStrikeDate: null,
}

const getTodayKey = () => new Date().toISOString().slice(0, 10)

const strikeSlice = createSlice({
  name: 'strike',
  initialState,
  reducers: {
    setFundPaymentStatus(state, action: PayloadAction<{ id: string; paid: boolean }>) {
      const fund = state.funds.find((entry) => entry.id === action.payload.id)
      if (!fund || fund.paid === action.payload.paid) {
        return
      }

      fund.paid = action.payload.paid
      if (action.payload.paid) {
        const todayKey = getTodayKey()
        if (state.lastStrikeDate !== todayKey) {
          state.strikeCount += 1
          state.lastStrikeDate = todayKey
        }
      } else {
        state.strikeCount = 0
        state.lastStrikeDate = null
        state.funds.forEach((entry) => {
          entry.paid = false
        })
      }
    },
    resetStrikeState(state) {
      state.funds = initialFunds.map((fund) => ({ ...fund }))
      state.strikeCount = 0
      state.lastStrikeDate = null
    },
  },
})

export const { setFundPaymentStatus, resetStrikeState } = strikeSlice.actions
export const strikeReducer = strikeSlice.reducer

export const selectStrikeFunds = (state: RootState) => state.strike.funds
export const selectStrikeCount = (state: RootState) => state.strike.strikeCount
