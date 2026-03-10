export const dynamic = 'force-dynamic'

// src/app/api/chat/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const conversation = await prisma.conversation.findFirst({
    where: { id: params.id, userId: session.userId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!conversation) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ conversation })
}
