// src/app/api/auth/set-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setTokenCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json())

    const reset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!reset || reset.used || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
    ])

    const jwtToken = await signToken({
      userId: reset.user.id,
      email: reset.user.email,
      role: reset.user.role,
    })
    setTokenCookie(jwtToken)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
}
