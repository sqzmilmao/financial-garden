import type { Metadata } from 'next'

import { SadaqaStrikeContent } from './SadaqaStrikeContent'

export const metadata: Metadata = {
  title: 'Sadaqa Strike',
  description: 'Track your public fund contributions and keep your strike alive.',
}

export default function SadaqaStrikePage() {
  return <SadaqaStrikeContent />
}

