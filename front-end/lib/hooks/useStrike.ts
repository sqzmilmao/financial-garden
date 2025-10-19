'use client'

import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/lib/state/hooks'
import { selectStrikeCount, selectStrikeFunds, setFundPaymentStatus } from '@/lib/state/slices/strikeSlice'

export const useStrike = () => {
  const dispatch = useAppDispatch()
  const funds = useAppSelector(selectStrikeFunds)
  const strikeCount = useAppSelector(selectStrikeCount)

  const updateFundStatus = useCallback(
    (id: string, paid: boolean) => {
      dispatch(setFundPaymentStatus({ id, paid }))
    },
    [dispatch],
  )

  return {
    funds,
    strikeCount,
    setFundPaymentStatus: updateFundStatus,
  }
}

