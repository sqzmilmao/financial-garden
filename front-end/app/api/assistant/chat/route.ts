import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

import { appendChatMessages, findFlower, listChatHistory } from '@/lib/server/data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { flowerId, userMessage } = body ?? {}

    if (!flowerId || typeof flowerId !== 'string') {
      return NextResponse.json({ error: 'flowerId is required.' }, { status: 400 })
    }

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'userMessage is required.' }, { status: 400 })
    }

    const flower = findFlower(flowerId)
    if (!flower) {
      return NextResponse.json({ error: `Flower with id ${flowerId} not found.` }, { status: 404 })
    }

    const timestamp = new Date().toISOString()
    const userEntry = {
      id: randomUUID(),
      role: 'user' as const,
      content: userMessage.trim(),
      timestamp,
    }

    const progress = flower.targetAmount > 0 ? flower.currentAmount / flower.targetAmount : 0
    const assistantEntry = {
      id: randomUUID(),
      role: 'assistant' as const,
      content: `Nice update! ${flower.name} is ${(progress * 100).toFixed(1)}% funded. Keep nurturing it.`,
      timestamp: new Date().toISOString(),
    }

    appendChatMessages(flowerId, [userEntry, assistantEntry])

    return NextResponse.json({ messages: listChatHistory(flowerId) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat message.' },
      { status: 500 },
    )
  }
}
