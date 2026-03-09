// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { clearTokenCookie } from '@/lib/auth'

export async function POST() {
  clearTokenCookie()
  return NextResponse.json({ success: true })
}
