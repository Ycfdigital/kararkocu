// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addCredits } from '@/lib/credits'
import { z } from 'zod'

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const where = search
    ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, credits: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ users, pagination: { page, total, pages: Math.ceil(total / limit) } })
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req)
  if (!session) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const schema = z.object({
    userId: z.string(),
    credits: z.number().int().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  })

  const { userId, credits, role } = schema.parse(await req.json())

  if (credits !== undefined) {
    await addCredits(userId, credits, undefined, `Admin tarafından manuel yükleme`)
  }

  if (role !== undefined) {
    await prisma.user.update({ where: { id: userId }, data: { role } })
  }

  return NextResponse.json({ success: true })
}
