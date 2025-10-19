export interface GrowthStage {
  stage: number
  minProgress: number
  maxProgress: number
  emoji: string
  description: string
}

export const growthStages: GrowthStage[] = [
  { stage: 1, minProgress: 0, maxProgress: 19, emoji: "🌱", description: "Small sprout" },
  { stage: 2, minProgress: 20, maxProgress: 39, emoji: "🌿", description: "Small plant" },
  { stage: 3, minProgress: 40, maxProgress: 59, emoji: "🌼", description: "Budding" },
  { stage: 4, minProgress: 60, maxProgress: 89, emoji: "🌺", description: "Blooming" },
  { stage: 5, minProgress: 90, maxProgress: 100, emoji: "🌷", description: "Fully grown" },
]

export function getGrowthStage(progress: number): GrowthStage {
  return growthStages.find((stage) => progress >= stage.minProgress && progress <= stage.maxProgress) || growthStages[0]
}

export function getFlowerColor(index: number): string {
  const colors = [
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#FF9800", // Orange
    "#2196F3", // Blue
    "#4CAF50", // Green
    "#F44336", // Red
    "#00BCD4", // Cyan
    "#FF5722", // Deep Orange
  ]
  return colors[index % colors.length]
}
