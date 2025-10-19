import { NextResponse } from 'next/server'

import { findFlower, listChatHistory } from '@/lib/server/data'

interface RouteContext {
  params: {
    flowerId: string
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { flowerId } = context.params

  if (!findFlower(flowerId)) {
    return NextResponse.json({ error: `Flower with id ${flowerId} not found.` }, { status: 404 })
  }

  return NextResponse.json({ messages: listChatHistory(flowerId) })
}
