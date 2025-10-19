import { NextResponse } from 'next/server'

import { addFlower, listFlowers } from '@/lib/server/data'

export async function GET() {
  return NextResponse.json(listFlowers())
}
