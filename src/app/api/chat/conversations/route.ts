// src/app/api/chat/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, title: true, language: true, createdAt: true, updatedAt: true,
      messages: { select: { id: true }, take: 1 },
    },
  })

  return NextResponse.json({ conversations })
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await req.json()

  await prisma.conversation.deleteMany({
    where: { id, userId: session.userId },
  })

  return NextResponse.json({ success: true })
}
