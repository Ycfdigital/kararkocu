// src/lib/credits.ts
import { prisma } from './prisma'

const CREDITS_PER_1000 = parseInt(process.env.CREDITS_PER_1000_WORDS || '10')

export function wordsToCredits(wordCount: number): number {
  return Math.ceil((wordCount / 1000) * CREDITS_PER_1000)
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function getUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })
  return user?.credits ?? 0
}

export async function deductCredits(
  userId: string,
  wordCount: number,
  messageId: string
): Promise<{ success: boolean; remaining: number }> {
  const cost = wordsToCredits(wordCount)

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      })

      if (!user || user.credits < cost) {
        throw new Error('INSUFFICIENT_CREDITS')
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: cost } },
      })

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -cost,
          type: 'USAGE',
          note: `Message ${messageId} — ${wordCount} words`,
        },
      })

      return updated.credits
    })

    return { success: true, remaining: result }
  } catch (err: any) {
    if (err.message === 'INSUFFICIENT_CREDITS') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } })
      return { success: false, remaining: user?.credits ?? 0 }
    }
    throw err
  }
}

export async function addCredits(
  userId: string,
  amount: number,
  wcOrderId?: string,
  note?: string
): Promise<number> {
  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { credits: { increment: amount } },
    })

    await tx.creditTransaction.create({
      data: {
        userId,
        amount,
        type: wcOrderId ? 'PURCHASE' : 'MANUAL',
        wcOrderId,
        note: note ?? `${amount} kredi yüklendi`,
      },
    })

    return user
  })

  return updated.credits
}
