import { GoogleGenerativeAI } from '@google/generative-ai'

interface FarmerData {
  // User basic info
  name?: string
  phone?: string
  location?: string

  // Farmer profile
  cropName: string
  soilType: string
  sowingDate: string
  hasStorageCapacity: boolean
  storageCapacity?: number
  irrigationMethod: string
  farmingExperience?: number
  farmSize?: number
  previousYield?: number

  // Environmental data
  currentWeather?: {
    temp: number
    humidity: number
    windSpeed: number
    description: string
    pressure: number
    cloudCover: number
  }

  // Satellite data
  ndviData?: {
    date: string
    ndviMean: number
    ndviStatus: string
    description: string
  }[]

  // Soil data
  soilData?: {
    date: string
    surfaceTemp: number
    soilTemp: number
    moisture: number
    moistureStatus: string
  }[]

  // Additional agromonitoring data
  uvIndex?: number
  forecast?: Array<{
    date: string
    high: number
    low: number
    description: string
    precipitation: number
  }>
}

interface AIInsightResponse {
  answer: string
  recommendations: string[]
  urgentAlerts?: string[]
  confidence: number
  sources: string[]
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor(apiKey?: string) {
    const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY

    if (!finalApiKey) {
      throw new Error("Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.")
    }

    this.genAI = new GoogleGenerativeAI(finalApiKey)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
  }

  /**
   * Generate farming insights based on farmer data and user question
   */
  async generateInsight(farmerData: FarmerData, userQuestion: string, history: { role: 'user' | 'assistant', content: string }[] = []): Promise<AIInsightResponse> {
    try {
      const prompt = this.buildPrompt(farmerData, userQuestion, history)

      console.log('[Gemini AI] Generating insight for question:', userQuestion)
      console.log('[Gemini AI] Data being passed to model:', {
        hasWeather: !!farmerData.currentWeather,
        hasNDVI: !!(farmerData.ndviData && farmerData.ndviData.length > 0),
        hasSoil: !!(farmerData.soilData && farmerData.soilData.length > 0),
        hasUV: farmerData.uvIndex !== undefined && farmerData.uvIndex !== null,
        ndviCount: farmerData.ndviData?.length || 0,
        soilCount: farmerData.soilData?.length || 0,
        crop: farmerData.cropName,
        soilType: farmerData.soilType,
        historyLength: history.length
      })

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the structured response
      return this.parseAIResponse(text)

    } catch (error) {
      console.error('[Gemini AI] Error generating insight:', error)
      throw new Error(`Failed to generate AI insight: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build comprehensive prompt with farmer data and context
   */
  private buildPrompt(farmerData: FarmerData, userQuestion: string, history: { role: 'user' | 'assistant', content: string }[] = []): string {
    const currentDate = new Date().toISOString().split('T')[0]

    // Format history for the prompt
    const historyText = history.length > 0
      ? history.map(msg => `${msg.role === 'user' ? 'FARMER' : 'AI ADVISOR'}: ${msg.content}`).join('\n\n')
      : 'No previous conversation history.'

    return `You are an expert agricultural advisor named KisanMitr (Friend of Farmer). Your goal is to provide accurate, data-driven farming advice based STRICTLY on the provided real-time data.

FARMER PROFILE:
- Name: ${farmerData.name || 'Not provided'}
- Location: ${farmerData.location || 'Not provided'}
- Crop: ${farmerData.cropName || 'Not specified'}
- Soil Type: ${farmerData.soilType || 'Not specified'}
- Sowing Date: ${farmerData.sowingDate || 'Not specified'}
- Irrigation Method: ${farmerData.irrigationMethod || 'Not specified'}
- Farm Size: ${farmerData.farmSize ? `${farmerData.farmSize} hectares` : 'Not provided'}
- Farming Experience: ${farmerData.farmingExperience ? `${farmerData.farmingExperience} years` : 'Not provided'}
- Storage Capacity: ${farmerData.hasStorageCapacity ? `Yes (${farmerData.storageCapacity || 'Not specified'} tons)` : 'No'}
- Previous Yield: ${farmerData.previousYield ? `${farmerData.previousYield} tons/hectare` : 'Not provided'}

CURRENT ENVIRONMENTAL CONDITIONS (Real-time):
${farmerData.currentWeather ? `
- Temperature: ${farmerData.currentWeather.temp}°C
- Humidity: ${farmerData.currentWeather.humidity}%
- Wind Speed: ${farmerData.currentWeather.windSpeed} km/h
- Weather Description: ${farmerData.currentWeather.description}
- Pressure: ${farmerData.currentWeather.pressure} hPa
- Cloud Cover: ${farmerData.currentWeather.cloudCover}%
` : '⚠️ REAL-TIME WEATHER DATA NOT AVAILABLE. Do not hallucinate weather conditions.'}

SATELLITE & NDVI DATA (Crop Health):
${farmerData.ndviData && farmerData.ndviData.length > 0 ?
        farmerData.ndviData.slice(-3).map(data => `
- [${data.date}] NDVI: ${data.ndviMean.toFixed(3)} (${data.ndviStatus})
  Details: ${data.description}`).join('\n') : '⚠️ NDVI SATELLITE DATA NOT AVAILABLE. Do not invent crop health metrics.'}

SOIL CONDITIONS (Moisture & Temp):
${farmerData.soilData && farmerData.soilData.length > 0 ?
        farmerData.soilData.slice(-3).map(data => `
- [${data.date}] Moisture: ${data.moisture}% (${data.moistureStatus})
  Surface Temp: ${data.surfaceTemp}°C | Soil Temp: ${data.soilTemp}°C`).join('\n') : '⚠️ SOIL SENSOR DATA NOT AVAILABLE. Do not invent soil moisture levels.'}

WEATHER FORECAST (Next 5 Days):
${farmerData.forecast && farmerData.forecast.length > 0 ?
        farmerData.forecast.slice(0, 5).map(day => `
- [${day.date}] ${day.high}°C / ${day.low}°C | ${day.description} | Rain: ${day.precipitation}mm`).join('\n') : '⚠️ FORECAST DATA NOT AVAILABLE.'}

UV INDEX: ${farmerData.uvIndex !== undefined && farmerData.uvIndex !== null ? `${farmerData.uvIndex} (${this.getUVRiskLevel(farmerData.uvIndex)} Risk)` : 'Not available'}

CONVERSATION HISTORY:
${historyText}

CURRENT QUESTION: "${userQuestion}"

INSTRUCTIONS:
1. **Analyze the Data:** First, look at the provided weather, soil, and satellite data.
2. **Be Direct:** Answer the specific question asked. Do not ramble.
3. **Cite Data:** Explicitly mention the data points you are using (e.g., "Since your soil moisture is low at 15%...", "With rain forecast for tomorrow...").
4. **Handle Missing Data:** If asked about something (e.g., "Should I water?") and the relevant data (e.g., soil moisture) is missing, STATE CLEARLY that you lack that data and give general advice based on the crop type and weather if available. DO NOT GUESS DATA.
5. **Context Matters:** Remember the conversation history. If the user refers to "it" or "that", look at the previous messages to understand context.
6. **Tone:** Professional, encouraging, and practical.

OUTPUT FORMAT (JSON ONLY):
{
  "answer": "Detailed answer...",
  "recommendations": ["Actionable step 1", "Actionable step 2"],
  "urgentAlerts": ["CRITICAL ALERT if applicable (e.g., frost risk, severe drought)"],
  "confidence": 85,
  "sources": ["Soil Sensors", "Weather Forecast", "Sentinel-2 Satellite"]
}

Current Date: ${currentDate}
Values provided in the prompt are REAL data for this specific farmer. Treat them as ground truth.
`
  }

  /**
   * Get UV risk level description
   */
  private getUVRiskLevel(uvIndex: number): string {
    if (uvIndex <= 2) return "Low"
    if (uvIndex <= 5) return "Moderate"
    if (uvIndex <= 7) return "High"
    if (uvIndex <= 10) return "Very High"
    return "Extreme"
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(text: string): AIInsightResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (!parsed.answer || !parsed.recommendations || typeof parsed.confidence !== 'number') {
        throw new Error('Invalid response structure')
      }

      return {
        answer: parsed.answer,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        urgentAlerts: Array.isArray(parsed.urgentAlerts) ? parsed.urgentAlerts : undefined,
        confidence: Math.min(100, Math.max(0, parsed.confidence)),
        sources: Array.isArray(parsed.sources) ? parsed.sources : []
      }

    } catch (error) {
      console.error('[Gemini AI] Failed to parse response:', error)
      console.log('[Gemini AI] Raw response:', text)

      // Fallback response
      return {
        answer: text.length > 500 ? text.substring(0, 500) + '...' : text,
        recommendations: ['Please consult with a local agricultural expert for specific advice'],
        confidence: 50,
        sources: ['AI Analysis']
      }
    }
  }

  /**
   * Generate crop-specific insights without user question
   */
  async generateCropInsights(farmerData: FarmerData): Promise<AIInsightResponse> {
    const question = `Based on my current farming data, what are the most important things I should focus on for my ${farmerData.cropName} crop right now?`
    return this.generateInsight(farmerData, question)
  }

  /**
   * Generate weather-based recommendations
   */
  async generateWeatherBasedRecommendations(farmerData: FarmerData): Promise<AIInsightResponse> {
    const question = `Based on the current weather conditions and forecast, what should I do to protect and optimize my ${farmerData.cropName} crop?`
    return this.generateInsight(farmerData, question)
  }

  /**
   * Generate irrigation recommendations
   */
  async generateIrrigationRecommendations(farmerData: FarmerData): Promise<AIInsightResponse> {
    const question = `Based on the soil moisture data and weather forecast, what irrigation schedule and practices should I follow for my ${farmerData.cropName}?`
    return this.generateInsight(farmerData, question)
  }
}

// Singleton instance
let geminiAIService: GeminiAIService | null = null

export function initializeGeminiAI(apiKey?: string): GeminiAIService {
  geminiAIService = new GeminiAIService(apiKey)
  return geminiAIService
}

export function getGeminiAI(): GeminiAIService {
  if (!geminiAIService) {
    try {
      geminiAIService = new GeminiAIService()
    } catch (error) {
      throw new Error("Gemini AI not initialized. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.")
    }
  }
  return geminiAIService
}

export type { FarmerData, AIInsightResponse }
export default GeminiAIService