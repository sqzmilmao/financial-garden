'use client'

import Link from 'next/link'
import { CheckCircle2, Flame, Repeat, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useStrike } from '@/lib/hooks/useStrike'

export function SadaqaStrikeContent() {
  const { funds, strikeCount, setFundPaymentStatus } = useStrike()

  return (
    <div className="garden-background min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Sadaqa Strike</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Stay on top of your public fund contributions. When you keep giving, your strike grows stronger — skip a
              payment and the streak fades.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-3xl bg-white/85 px-6 py-4 shadow-lg ring-1 ring-orange-200">
            <Flame className="size-10 text-orange-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-orange-500">Strike Counter</p>
              <p className="text-5xl font-black text-slate-900">{strikeCount}</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-slate-100 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Public Funds</h2>
              <p className="text-sm text-slate-500">Update each fund once you have made today&rsquo;s contribution.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/">
                <Repeat className="size-4" />
                Back to Garden
              </Link>
            </Button>
          </div>

          <div className="mt-6 grid gap-4">
            {funds.map((fund) => {
              const statusLabel = fund.paid ? 'Paid' : 'Not Paid'
              const statusClasses = fund.paid
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-600'

              return (
                <div
                  key={fund.id}
                  className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    {fund.paid ? (
                      <CheckCircle2 className="size-6 text-emerald-500" aria-hidden />
                    ) : (
                      <XCircle className="size-6 text-slate-400" aria-hidden />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{fund.name}</h3>
                      <span
                        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
                      >
                        {statusLabel}
                      </span>
                      <p className="mt-3 text-xs text-slate-500">
                        {fund.paid
                          ? 'Great work! This keeps your strike blazing.'
                          : 'Your strike cools here until you contribute.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant={fund.paid ? 'secondary' : 'default'}
                      onClick={() => setFundPaymentStatus(fund.id, !fund.paid)}
                      className="gap-2"
                    >
                      {fund.paid ? 'Mark as Not Paid' : 'Mark as Paid'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

