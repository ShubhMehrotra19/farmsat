"use client"

import React from "react"
import { Phone, Clock, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface KisanCallCenterProps {
  className?: string
}

export function KisanCallCenter({ className }: KisanCallCenterProps) {
  const kisanCallCenter = {
    name: "Kisan Call Center (KCC)",
    tollFreeNumber: "1800-180-1551",
    operatingHours: "24/7",
    languages: ["Hindi", "English", "Regional Languages"],
    services: [
      "Crop-related queries",
      "Weather information",
      "Pest and disease management",
      "Government schemes",
      "Market prices",
      "Agricultural technology",
    ],
  }

  const handleCall = () => {
    // Use tel: protocol to initiate call
    window.location.href = `tel:${kisanCallCenter.tollFreeNumber.replace(/\s+/g, "")}`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          {kisanCallCenter.name}
        </CardTitle>
        <CardDescription>
          Get expert agricultural advice from government experts - Available 24/7 in multiple languages
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div>
            <div className="font-semibold text-green-800">Toll-Free Number</div>
            <div className="text-2xl font-bold text-green-600">{kisanCallCenter.tollFreeNumber}</div>
          </div>
          <Button onClick={handleCall} className="bg-green-600 hover:bg-green-700 text-white" size="lg">
            <Phone className="w-4 h-4 mr-2" />
            Call Now
          </Button>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Operating Hours: {kisanCallCenter.operatingHours}</span>
        </div>

        {/* Supported Languages */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Supported Languages:</span>
          <div className="flex gap-1 flex-wrap">
            {kisanCallCenter.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        {/* Services Offered */}
        <div>
          <h4 className="font-medium mb-2">Services Available:</h4>
          <div className="grid grid-cols-1 gap-1">
            {kisanCallCenter.services.map((service) => (
              <div key={service} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                {service}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">About Kisan Call Center:</p>
          <p>
            Operated by the Ministry of Agriculture & Farmers Welfare, Government of India since 2004. Connect with
            agricultural experts for personalized advice on farming practices, government schemes, and modern
            agricultural techniques.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
