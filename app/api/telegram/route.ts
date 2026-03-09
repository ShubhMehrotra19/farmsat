import { NextRequest, NextResponse } from 'next/server'

// Telegram Bot API configuration
const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

// In-memory storage for subscriptions (in production, use database)
export let telegramSubscriptions: { [userId: string]: { chatId: string; subscribed: boolean; location?: string } } = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, chatId, location } = body

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      )
    }

    switch (action) {
      case 'subscribe':
        if (!chatId || !userId) {
          return NextResponse.json(
            { error: 'Chat ID and User ID are required' },
            { status: 400 }
          )
        }

        // Validate chat ID is numeric
        if (isNaN(Number(chatId))) {
          return NextResponse.json(
            { error: 'Chat ID must be numeric. You provided: ' + chatId + '. Please get your numeric Chat ID from @userinfobot on Telegram.' },
            { status: 400 }
          )
        }

        try {
          // Send welcome message first to verify chat ID is valid
          await sendTelegramMessage(chatId, `🌱 Welcome to FarmSat Weather Updates!\n\nYou'll receive daily weather updates for your farming location: ${location || 'Default Location'}\n\nUse /unsubscribe to stop receiving updates.`)

          // Only save subscription if message was sent successfully
          telegramSubscriptions[userId] = {
            chatId,
            subscribed: true,
            location: location || 'Default Location'
          }
        } catch (error: any) {
          console.error('[Telegram Subscribe] Error:', error)
          return NextResponse.json(
            { error: 'Failed to send message to Telegram ChatID. Error: ' + error.message + '. Make sure the Chat ID is correct and you\'ve started a conversation with @farmsat_bot.' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully subscribed to daily weather updates'
        })

      case 'unsubscribe':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          )
        }

        if (telegramSubscriptions[userId]) {
          const chatId = telegramSubscriptions[userId].chatId
          telegramSubscriptions[userId].subscribed = false

          await sendTelegramMessage(chatId, '❌ You have unsubscribed from FarmSat weather updates. Send /subscribe to start receiving updates again.')

          return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed from weather updates'
          })
        }

        return NextResponse.json(
          { error: 'User not found in subscriptions' },
          { status: 404 }
        )

      case 'send_weather_update':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          )
        }

        const subscription = telegramSubscriptions[userId]
        if (!subscription || !subscription.subscribed) {
          return NextResponse.json(
            { error: 'User not subscribed or subscription inactive' },
            { status: 404 }
          )
        }

        // This would be called by a cron job or scheduled task
        // For now, just acknowledge
        return NextResponse.json({
          success: true,
          message: 'Weather update queued for sending'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('[Telegram API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const subscription = telegramSubscriptions[userId]

    return NextResponse.json({
      subscribed: subscription?.subscribed || false,
      chatId: subscription?.chatId || null,
      location: subscription?.location || null
    })
  } catch (error: any) {
    console.error('[Telegram API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to send Telegram messages
async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    })

    const responseData = await response.json()

    if (!response.ok) {
      const errorMsg = responseData.description || `HTTP ${response.status}`
      console.error('[Telegram API Response]:', responseData)
      throw new Error(`Telegram API error: ${errorMsg}`)
    }

    return responseData
  } catch (error) {
    console.error('[Telegram] Failed to send message:', error)
    throw error
  }
}

// Export for use in other parts of the app
export { sendTelegramMessage }