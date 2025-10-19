import { NextResponse } from 'next/server'

import { addFlower } from '@/lib/server/data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, targetAmount, category } = body ?? {}

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }

    if (typeof targetAmount !== 'number' || Number.isNaN(targetAmount) || targetAmount <= 0) {
      return NextResponse.json({ error: 'targetAmount must be a positive number.' }, { status: 400 })
    }

    const allowedCategories = ['travel', 'education', 'property', 'car']
    if (!allowedCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
    }

    const newFlower = addFlower({
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      targetAmount,
      category,
    })

    return NextResponse.json(newFlower, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create flower.' },
      { status: 500 },
    )
  }
}
