import { useCallback, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks"
import {
  fetchFlowerById,
  selectFlowerDetails,
  selectFlowerDetailsError,
  selectFlowerDetailsStatus,
} from "@/lib/state/slices/flowerDetailsSlice"

export const useFlowerDetails = (id: string | null | undefined) => {
  const dispatch = useAppDispatch()

  const data = useAppSelector((state) => (id ? selectFlowerDetails(state, id) : undefined))
  const status = useAppSelector((state) => (id ? selectFlowerDetailsStatus(state, id) : "idle"))
  const error = useAppSelector((state) => (id ? selectFlowerDetailsError(state, id) : null))

  // ⚡ Всегда подгружаем при каждом изменении id (новый цветок)
  useEffect(() => {
    if (!id) return
    void dispatch(fetchFlowerById({ id, force: true }))
  }, [dispatch, id])

  // ⚡ Возможность ручного обновления
  const refetch = useCallback(() => {
    if (!id) return
    void dispatch(fetchFlowerById({ id, force: true }))
  }, [dispatch, id])

  return {
    data,
    status,
    error,
    refetch,
  }
}
