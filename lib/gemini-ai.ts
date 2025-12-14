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
  async generateInsight(farmerData: FarmerData, userQuestion: string): Promise<AIInsightResponse> {
    try {
      const prompt = this.buildPrompt(farmerData, userQuestion)
      
      console.log('[Gemini AI] Generating insight for question:', userQuestion)
      console.log('[Gemini AI] Data being passed to model:', {
        hasWeather: !!farmerData.currentWeather,
        hasNDVI: !!(farmerData.ndviData && farmerData.ndviData.length > 0),
        hasSoil: !!(farmerData.soilData && farmerData.soilData.length > 0), 
        hasUV: farmerData.uvIndex !== undefined && farmerData.uvIndex !== null,
        ndviCount: farmerData.ndviData?.length || 0,
        soilCount: farmerData.soilData?.length || 0,
        crop: farmerData.cropName,
        soilType: farmerData.soilType
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
  private buildPrompt(farmerData: FarmerData, userQuestion: string): string {
    const currentDate = new Date().toISOString().split('T')[0]
    
    return `You are an expert agricultural advisor with deep knowledge of farming practices, crop management, and agricultural technology. 

FARMER PROFILE:
- Name: ${farmerData.name || 'Not provided'}
- Location: ${farmerData.location || 'Not provided'}
- Crop: ${farmerData.cropName}
- Soil Type: ${farmerData.soilType}
- Sowing Date: ${farmerData.sowingDate}
- Irrigation Method: ${farmerData.irrigationMethod}
- Farm Size: ${farmerData.farmSize ? `${farmerData.farmSize} hectares` : 'Not provided'}
- Farming Experience: ${farmerData.farmingExperience ? `${farmerData.farmingExperience} years` : 'Not provided'}
- Storage Capacity: ${farmerData.hasStorageCapacity ? `Yes (${farmerData.storageCapacity || 'Not specified'} tons)` : 'No'}
- Previous Yield: ${farmerData.previousYield ? `${farmerData.previousYield} tons/hectare` : 'Not provided'}

CURRENT ENVIRONMENTAL CONDITIONS:
${farmerData.currentWeather ? `
- Temperature: ${farmerData.currentWeather.temp}°C
- Humidity: ${farmerData.currentWeather.humidity}%
- Wind Speed: ${farmerData.currentWeather.windSpeed} km/h
- Weather: ${farmerData.currentWeather.description}
- Pressure: ${farmerData.currentWeather.pressure} hPa
- Cloud Cover: ${farmerData.currentWeather.cloudCover}%
` : 'Weather data not available'}

SATELLITE & NDVI DATA:
${farmerData.ndviData && farmerData.ndviData.length > 0 ? 
  farmerData.ndviData.slice(-3).map(data => `
- Date: ${data.date}, NDVI: ${data.ndviMean}, Status: ${data.ndviStatus}
- ${data.description}`).join('\n') : `No recent NDVI satellite data available for this field. This could be due to cloud cover, recent field setup, or data processing delays. Provide general crop health monitoring advice based on the farmer's crop type and current weather conditions.`}

SOIL CONDITIONS:
${farmerData.soilData && farmerData.soilData.length > 0 ? 
  farmerData.soilData.slice(-3).map(data => `
- Date: ${data.date}, Soil Moisture: ${data.moisture}%, Status: ${data.moistureStatus}
- Surface Temp: ${data.surfaceTemp}°C, Soil Temp: ${data.soilTemp}°C`).join('\n') : `No recent soil monitoring data available. This typically requires field sensors or premium satellite data access. Provide irrigation and soil management advice based on the farmer's soil type, crop requirements, and current weather conditions.`}

WEATHER FORECAST:
${farmerData.forecast && farmerData.forecast.length > 0 ?
  farmerData.forecast.slice(0, 5).map(day => `
- ${day.date}: ${day.high}°C/${day.low}°C, ${day.description}, Precipitation: ${day.precipitation}mm`).join('\n') : 'Forecast not available'}

UV INDEX: ${farmerData.uvIndex !== undefined && farmerData.uvIndex !== null ? `${farmerData.uvIndex} (Risk Level: ${this.getUVRiskLevel(farmerData.uvIndex)})` : `No current UV index data available. Provide general advice for sun protection and optimal work timing based on current weather conditions and time of day.`}

FARMER'S QUESTION: "${userQuestion}"

Please provide a comprehensive, practical answer following this EXACT JSON format:

{
  "answer": "Detailed answer to the farmer's question with specific, actionable advice based on the provided data. Include relevant insights from the environmental, soil, and satellite data.",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2", 
    "Specific actionable recommendation 3"
  ],
  "urgentAlerts": [
    "Any urgent issues that need immediate attention (only if critical)"
  ],
  "confidence": 85,
  "sources": [
    "Current weather conditions",
    "NDVI satellite data", 
    "Soil moisture data",
    "Agricultural best practices"
  ]
}

IMPORTANT GUIDELINES:
1. Base your advice on the specific crop (${farmerData.cropName}), soil type (${farmerData.soilType}), and current growth stage
2. Consider the farmer's irrigation method (${farmerData.irrigationMethod}) and storage capacity
3. Use the environmental data to provide timely, relevant advice
4. Include specific numbers and thresholds when relevant
5. Prioritize practical, implementable solutions
6. If data is limited, acknowledge this but still provide valuable general guidance
7. Include urgentAlerts only for critical issues requiring immediate action
8. Confidence should be between 0-100 based on data availability and certainty
9. Current date for reference: ${currentDate}

Respond ONLY with the JSON format above, no additional text.`
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