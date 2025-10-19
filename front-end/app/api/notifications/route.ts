import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

import { addNotification as storeNotification, listNotifications, type FlowerCategory } from '@/lib/server/data'

export async function GET() {
  return NextResponse.json(listNotifications())
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { id, title, message, coupon, company, category, createdAt, read } = payload ?? {}

    if (!title || !message || !coupon || !company || !category) {
      return NextResponse.json({ error: 'Invalid notification payload.' }, { status: 400 })
    }

    const normalizedCategory = String(category) as FlowerCategory
    if (!['travel', 'education', 'property', 'car'].includes(normalizedCategory)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
    }

    storeNotification({
      id: id ?? randomUUID(),
      title,
      message,
      coupon,
      company,
      category: normalizedCategory,
      createdAt: createdAt ?? new Date().toISOString(),
      read: Boolean(read),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to store notification.' },
      { status: 500 },
    )
  }
}
