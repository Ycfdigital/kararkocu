export const dynamic = 'force-dynamic'

// src/app/api/credits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const [user, transactions, total] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId }, select: { credits: true } }),
    prisma.creditTransaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.creditTransaction.count({ where: { userId: session.userId } }),
  ])

  return NextResponse.json({
    balance: user?.credits ?? 0,
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
