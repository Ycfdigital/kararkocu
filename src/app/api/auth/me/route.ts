export const dynamic = 'force-dynamic'

// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, credits: true, role: true, language: true },
  })

  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ user })
}
