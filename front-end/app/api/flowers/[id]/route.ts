import { NextResponse } from 'next/server'

import { getFlowerDetails } from '@/lib/server/data'

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = context.params
  const details = getFlowerDetails(id)

  if (!details) {
    return NextResponse.json({ error: `Flower with id ${id} not found.` }, { status: 404 })
  }

  return NextResponse.json(details)
}
