import { useCallback, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/lib/state/hooks'
import {
  createFlower,
  fetchFlowers,
  selectFlowers,
  selectFlowersError,
  selectFlowersStatus,
} from '@/lib/state/slices/flowersSlice'

export const useFlowers = () => {
  const dispatch = useAppDispatch()
  const flowers = useAppSelector(selectFlowers)
  const status = useAppSelector(selectFlowersStatus)
  const error = useAppSelector(selectFlowersError)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchFlowers())
    }
  }, [dispatch, status])

  const refetch = useCallback(() => {
    void dispatch(fetchFlowers({ force: true }))
  }, [dispatch])

  const addFlower = useCallback(
    (input: { name: string; description: string; targetAmount: number }) => dispatch(createFlower(input)).unwrap(),
    [dispatch],
  )

  return {
    flowers,
    status,
    error,
    refetch,
    createFlower: addFlower,
  }
}
