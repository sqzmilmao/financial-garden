import { NextResponse } from 'next/server'

import { listCoupons } from '@/lib/server/data'

export async function GET() {
  return NextResponse.json(listCoupons())
}
