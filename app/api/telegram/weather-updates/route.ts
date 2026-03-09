import { NextRequest, NextResponse } from 'next/server'
import { getFarmerDataAggregator } from '@/lib/farmer-data-aggregator'
import { sendTelegramMessage, telegramSubscriptions } from '../route'

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduled task
    // For security, you might want to add authentication

    const dataAggregator = getFarmerDataAggregator()
    const results = []

    // Get all subscribed users
    for (const [userId, subscription] of Object.entries(telegramSubscriptions)) {
      if (!subscription.subscribed) continue

      try {
        // Get user's farming data
        const farmerData = await dataAggregator.getFarmerData(userId, {
          includeHistoricalData: true,
          maxHistoryDays: 1, // Just need current data
          requireAllData: false
        })

        // Generate weather update message
        const weatherMessage = generateWeatherUpdateMessage(farmerData)

        // Send to Telegram
        await sendTelegramMessage(subscription.chatId, weatherMessage)

        results.push({
          userId,
          status: 'sent',
          chatId: subscription.chatId
        })

      } catch (error: any) {
        console.error(`Failed to send weather update to user ${userId}:`, error)
        results.push({
          userId,
          status: 'failed',
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weather updates sent to ${results.filter(r => r.status === 'sent').length} users`,
      results
    })

  } catch (error: any) {
    console.error('[Weather Updates API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateWeatherUpdateMessage(farmerData: any): string {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let message = `🌱 **FarmSat Daily Weather Update**\n`
  message += `📅 ${currentDate}\n\n`

  if (farmerData.currentWeather) {
    const weather = farmerData.currentWeather
    message += `🌡️ **Current Weather:**\n`
    message += `• Temperature: ${weather.temp}°C\n`
    message += `• Humidity: ${weather.humidity}%\n`
    message += `• Wind: ${weather.windSpeed} km/h\n`
    message += `• Conditions: ${weather.description}\n\n`
  }

  if (farmerData.forecast && farmerData.forecast.length > 0) {
    message += `📈 **3-Day Forecast:**\n`
    farmerData.forecast.slice(0, 3).forEach((day: any, index: number) => {
      const date = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
      message += `• ${date}: ${day.high}°/${day.low}°C, ${day.description}\n`
    })
    message += `\n`
  }

  if (farmerData.ndviData && farmerData.ndviData.length > 0) {
    const latestNDVI = farmerData.ndviData[0]
    message += `🌾 **Crop Health (NDVI):** ${latestNDVI.ndviMean.toFixed(3)} - ${latestNDVI.ndviStatus}\n\n`
  }

  if (farmerData.soilData && farmerData.soilData.length > 0) {
    const latestSoil = farmerData.soilData[0]
    message += `🌱 **Soil Conditions:**\n`
    message += `• Moisture: ${latestSoil.moisture}%\n`
    message += `• Temperature: ${latestSoil.soilTemp}°C\n\n`
  }

  if (farmerData.uvIndex !== undefined && farmerData.uvIndex !== null) {
    const uvRisk = farmerData.uvIndex > 8 ? 'Very High' : farmerData.uvIndex > 6 ? 'High' : farmerData.uvIndex > 2 ? 'Moderate' : 'Low'
    message += `☀️ **UV Index:** ${farmerData.uvIndex} (${uvRisk} risk)\n\n`
  }

  message += `💡 **Farming Tips:**\n`
  if (farmerData.currentWeather?.temp && farmerData.currentWeather.temp > 35) {
    message += `• High temperature alert! Ensure adequate irrigation and provide shade for sensitive crops.\n`
  }
  if (farmerData.currentWeather?.humidity && farmerData.currentWeather.humidity > 80) {
    message += `• High humidity detected. Monitor for fungal diseases.\n`
  }
  if (farmerData.soilData?.[0]?.moisture && farmerData.soilData[0].moisture < 30) {
    message += `• Soil moisture is low. Consider irrigation today.\n`
  }

  message += `\n📱 Stay connected with FarmSat for more insights!\n`
  message += `Use /unsubscribe to stop receiving updates.`

  return message
}

// Export the subscriptions for sharing with telegram route
export { telegramSubscriptions }