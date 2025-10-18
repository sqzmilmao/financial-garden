"use client"

import { motion } from "framer-motion"

import { Progress } from "@/components/ui/progress"
import { getFlowerColor, getGrowthStage } from "@/lib/growth-stages"
import type { FlowerSummary } from "@/lib/state/types"

interface FlowerCardProps {
  flower: FlowerSummary
  index: number
  onClick: () => void
}

export function FlowerCard({ flower, index, onClick }: FlowerCardProps) {
  const progressPercent = Math.round(flower.progress * 100)
  const stage = getGrowthStage(progressPercent)
  const color = getFlowerColor(index)
  const isFullyGrown = stage.stage === 5

  return (
    <motion.div
      className="relative flex cursor-pointer flex-col items-center"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute -top-6 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
        {progressPercent}%
      </div>

      <motion.div
        className="relative flower-sway"
        style={{
          filter: `drop-shadow(0 0 ${isFullyGrown ? "20px" : "12px"} ${color}40)`,
        }}
      >
        <div
          className="mb-2 text-7xl"
          style={{
            filter: isFullyGrown ? `drop-shadow(0 0 8px ${color})` : "none",
          }}
        >
          {stage.emoji}
        </div>
      </motion.div>

      <div className="relative h-16 w-20 rounded-b-full bg-gradient-to-b from-amber-700 to-amber-900">
        <div className="absolute inset-x-2 top-0 h-2 rounded-full bg-amber-800" />
      </div>

      <div className="mt-3 w-24">
        <Progress
          value={progressPercent}
          className="h-2"
          style={{
            ["--progress-background" as string]: color,
          }}
        />
      </div>

      <p className="mt-2 max-w-24 truncate text-center text-xs font-medium text-gray-700">{flower.name}</p>
    </motion.div>
  )
}
