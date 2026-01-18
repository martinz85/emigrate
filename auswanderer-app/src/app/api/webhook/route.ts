import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Stripe Webhook Handler - wird in Story 4.3 implementiert
  return NextResponse.json({ received: true })
}

