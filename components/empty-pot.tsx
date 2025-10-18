"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

interface EmptyPotProps {
  onClick: () => void
}

export function EmptyPot({ onClick }: EmptyPotProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Empty pot */}
      <div className="w-20 h-20 bg-gradient-to-b from-amber-700/50 to-amber-900/50 rounded-b-full relative flex items-center justify-center">
        <div className="absolute inset-x-2 top-0 h-2 bg-amber-800/50 rounded-full" />
        <Plus className="w-8 h-8 text-amber-200/70 mt-4" />
      </div>
      <p className="text-xs text-gray-500 mt-4">Add Goal</p>
    </motion.div>
  )
}
