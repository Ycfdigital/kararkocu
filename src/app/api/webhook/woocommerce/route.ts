// src/app/api/webhook/woocommerce/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCredits } from '@/lib/credits'
import { sendPasswordSetupEmail } from '@/lib/email'
import crypto from 'crypto'
import { randomBytes } from 'crypto'

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.WC_WEBHOOK_SECRET!
  const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  return hmac === signature
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-wc-webhook-signature') || ''

    // Verify HMAC signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const order = JSON.parse(rawBody)

    // Only process completed orders
    if (order.status !== 'completed') {
      return NextResponse.json({ received: true, action: 'skipped', reason: 'not completed' })
    }

    const email = order.billing?.email?.toLowerCase()
    const name = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim()

    if (!email) {
      return NextResponse.json({ error: 'No email in order' }, { status: 400 })
    }

    // Prevent duplicate processing
    const existing = await prisma.creditTransaction.findFirst({
      where: { wcOrderId: String(order.id), type: 'PURCHASE' },
    })
    if (existing) {
      return NextResponse.json({ received: true, action: 'skipped', reason: 'already processed' })
    }

    // Calculate total credits from line items
    let totalCredits = 0
    for (const item of order.line_items || []) {
      // Read _kararkocu_credits meta from product
      const creditsMeta = item.meta_data?.find(
        (m: any) => m.key === '_kararkocu_credits'
      )
      if (creditsMeta) {
        totalCredits += parseInt(creditsMeta.value) * (item.quantity || 1)
      }
    }

    if (totalCredits === 0) {
      // Fallback: if no meta found, grant 100 credits per item
      totalCredits = order.line_items?.reduce(
        (sum: number, item: any) => sum + 100 * (item.quantity || 1), 0
      ) || 100
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    let isNewUser = false

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || undefined, credits: 0 },
      })
      isNewUser = true
    }

    // Add credits
    await addCredits(user.id, totalCredits, String(order.id), `WooCommerce Order #${order.id}`)

    // Create password setup token for new users
    if (isNewUser || !user.passwordHash) {
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.passwordReset.create({
        data: { userId: user.id, token, expiresAt },
      })

      await sendPasswordSetupEmail(email, name, token, 'tr')
    }

    console.log(`Webhook processed: Order #${order.id}, ${totalCredits} credits → ${email}`)

    return NextResponse.json({
      received: true,
      action: 'processed',
      credits: totalCredits,
      newUser: isNewUser,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
