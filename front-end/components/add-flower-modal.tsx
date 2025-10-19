"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddFlowerModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string; targetAmount: number; category: "travel" | "education" | "property" | "car" }) => Promise<void> | void
  loading?: boolean
  error?: string | null
}

export function AddFlowerModal({ open, onClose, onSubmit, loading = false, error = null }: AddFlowerModalProps) {
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"travel" | "education" | "property" | "car">("travel")
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setName("")
      setTarget("")
      setDescription("")
       setCategory("travel")
      setLocalError(null)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const parsedTarget = Number.parseFloat(target)

    if (!trimmedName) {
      setLocalError("Please provide a flower name.")
      return
    }

    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      setLocalError("Target amount must be greater than zero.")
      return
    }

    setLocalError(null)
    await onSubmit({
      name: trimmedName,
      description: description.trim(),
      targetAmount: parsedTarget,
      category,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Add Flower Goal</h2>
          <button
            type="button"
            className="text-slate-400 transition-colors hover:text-slate-600"
            onClick={onClose}
            aria-label="Close add flower modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="flower-name" className="mb-2 block text-sm font-medium text-slate-600">
              Flower name
            </label>
            <Input
              id="flower-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Emergency Fund"
              required
            />
          </div>

          <div>
            <label htmlFor="flower-target" className="mb-2 block text-sm font-medium text-slate-600">
              Target amount
            </label>
            <Input
              id="flower-target"
              type="number"
              min="0"
              step="0.01"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="5000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-600" htmlFor="flower-category">
              Category
            </label>
            <select
              id="flower-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as typeof category)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-teal-400"
            >
              <option value="travel">Travel</option>
              <option value="education">Education</option>
              <option value="property">Property</option>
              <option value="car">Car</option>
            </select>
          </div>

          <div>
            <label htmlFor="flower-description" className="mb-2 block text-sm font-medium text-slate-600">
              Description (optional)
            </label>
            <textarea
              id="flower-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell us what makes this goal special..."
              className="min-h-[96px] w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner outline-none transition focus:border-teal-500"
            />
          </div>

          {(localError || error) && <p className="text-sm text-red-500">{localError ?? error}</p>}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-teal-500 text-white hover:bg-teal-600">
              {loading ? "Adding..." : "Add Flower"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
