// src/app/api/chat/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { streamArchitectResponse } from '@/lib/gemini'
import { countWords, deductCredits, getUserCredits } from '@/lib/credits'
import { z } from 'zod'

const schema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  language: z.enum(['tr', 'en']).default('tr'),
})

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { message, conversationId, language } = schema.parse(body)

    // Check credits
    const credits = await getUserCredits(session.userId)
    if (credits <= 0) {
      return NextResponse.json({ error: 'insufficient_credits' }, { status: 402 })
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: session.userId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.userId,
          language,
          title: message.slice(0, 60) + (message.length > 60 ? '…' : ''),
        },
        include: { messages: true },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        wordCount: countWords(message),
      },
    })

    // Build Gemini history
    const history = conversation.messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }],
    }))

    history.push({ role: 'user', parts: [{ text: message }] })

    // Stream response
    const stream = await streamArchitectResponse(history, language as 'tr' | 'en')

    let fullResponse = ''
    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text()
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }

          // Save assistant message & deduct credits
          const wordCount = countWords(fullResponse)
          const savedMsg = await prisma.message.create({
            data: {
              conversationId: conversation!.id,
              role: 'assistant',
              content: fullResponse,
              wordCount,
            },
          })

          const { success, remaining } = await deductCredits(session.userId, wordCount, savedMsg.id)

          // Update conversation title if first exchange
          if (conversation!.messages.length === 0) {
            await prisma.conversation.update({
              where: { id: conversation!.id },
              data: { title: message.slice(0, 60) + (message.length > 60 ? '…' : '') },
            })
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                conversationId: conversation!.id,
                credits: remaining,
                creditWarning: !success,
              })}\n\n`
            )
          )
          controller.close()
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
