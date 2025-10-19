'use client'

import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export function SadaqaStrikeButton() {
  const router = useRouter()
  const pathname = usePathname()
  const isOnStrikePage = useMemo(() => pathname === '/sadaqa-strike', [pathname])

  const handleClick = () => {
    if (isOnStrikePage) return
    router.push('/sadaqa-strike')
  }

  return (
    <button
      type="button"
      aria-label="Open Sadaqa Strike"
      onClick={handleClick}
      disabled={isOnStrikePage}
      className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-orange-400 via-red-500 to-red-600 shadow-lg transition hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 disabled:cursor-default disabled:opacity-80"
    >
      <Flame className="size-9 text-white/90 drop-shadow-[0_0_18px_rgba(255,145,0,0.55)]" />
      <span className="pointer-events-none absolute -bottom-0.5 right-1 text-lg font-black text-white/90 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:text-white">
        4
      </span>
    </button>
  )
}
