"use client"

import React, { useState, useEffect } from "react"
import { MessageSquare, Bell, BellOff, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface TelegramBotProps {
  userId: string
  userLocation?: string
  className?: string
}

export function TelegramBot({ userId, userLocation, className }: TelegramBotProps) {
  const [chatId, setChatId] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus()
  }, [userId])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/telegram?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(data.subscribed)
        setSubscriptionStatus(data)
      }
    } catch (error) {
      console.error("Failed to check subscription status:", error)
    }
  }

  const handleSubscribe = async () => {
    if (!chatId.trim()) {
      setError("Please enter your Telegram Chat ID")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "subscribe",
          userId,
          chatId: chatId.trim(),
          location: userLocation || "Default Location",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        setSuccess(data.message)
        setSubscriptionStatus({ chatId: chatId.trim(), subscribed: true, location: userLocation })
      } else {
        setError(data.error || "Failed to subscribe")
      }
    } catch (error: any) {
      setError("Failed to connect to Telegram service")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "unsubscribe",
          userId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(false)
        setSuccess(data.message)
        setSubscriptionStatus({ ...subscriptionStatus, subscribed: false })
      } else {
        setError(data.error || "Failed to unsubscribe")
      }
    } catch (error: any) {
      setError("Failed to connect to Telegram service")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Daily Weather Updates via Telegram
        </CardTitle>
        <CardDescription>
          Get daily weather forecasts and farming insights sent directly to your Telegram
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <>
              <Bell className="w-4 h-4 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Subscribed
              </Badge>
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4 text-gray-400" />
              <Badge variant="outline">Not Subscribed</Badge>
            </>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Important Warning */}
        <Alert className="bg-amber-50 border-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Important:</strong> Your Chat ID is a number (like 123456789), NOT your Telegram username (like
            @username)
          </AlertDescription>
        </Alert>

        {/* Subscription Form */}
        {!isSubscribed ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="chatId">Your Telegram Chat ID (Numeric Only)</Label>
              <Input
                id="chatId"
                placeholder="Example: 123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="mt-1"
                type="number"
              />
              <p className="text-xs text-muted-foreground mt-1">❌ Do NOT enter: @username or @user_me02</p>
              <p className="text-xs text-muted-foreground">✅ Enter numbers only: 123456789</p>
            </div>

            <Button onClick={handleSubscribe} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Subscribing..." : "Subscribe to Daily Updates"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm">
                <div className="font-medium text-green-800">Active Subscription</div>
                <div className="text-green-600 mt-1">
                  Daily weather updates for: {subscriptionStatus?.location || userLocation || "Your Location"}
                </div>
                <div className="text-xs text-green-600 mt-1">Chat ID: {subscriptionStatus?.chatId}</div>
              </div>
            </div>

            <Button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              {isLoading ? "Unsubscribing..." : "Unsubscribe"}
            </Button>
          </div>
        )}

        {/* Features */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">What you'll receive:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Daily weather forecast for your farming location
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Irrigation recommendations based on weather
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Crop health alerts and farming tips
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              Market price updates and recommendations
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg">
          <p className="font-medium mb-2 text-blue-900">📱 How to find your numeric Chat ID:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
            <li>Open Telegram app on your phone</li>
            <li>
              Search for and open <strong>@userinfobot</strong>
            </li>
            <li>
              Send the command <code className="bg-white px-1 rounded">/start</code>
            </li>
            <li>
              The bot will show your <strong>"Your user id:"</strong> - this is a number like <strong>123456789</strong>
            </li>
            <li>
              Copy this <strong>number</strong> and paste it in the field above
            </li>
          </ol>
          <p className="text-xs text-blue-700 mt-2 italic">
            ⚠️ The number you get from @userinfobot is what you need. Do NOT use your Telegram @username.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
