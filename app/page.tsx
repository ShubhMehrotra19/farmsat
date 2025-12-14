"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ComprehensiveOnboarding } from "@/components/comprehensive-onboarding"
import { Hero } from "@/components/landing-page/Hero"
import { Features } from "@/components/landing-page/Features"
import { Footer } from "@/components/landing-page/Footer"

export default function LandingPage() {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleStartOnboarding = () => {
    setShowOnboarding(true)
  }

  const handleOnboardingComplete = async (data: any) => {
    try {
      const response = await fetch('/api/comprehensive-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save profile')
      }

      const result = await response.json()

      const userData = {
        userId: data.userId,
        fullName: data.fullName,
        mobile: data.mobile,
        pincode: data.pincode,
        location: data.location,
        pincodeLocation: data.pincodeLocation,
        farmFields: data.farmFields,
        profileComplete: true,
        aiInsights: result.profile?.aiInsights,
        weatherData: result.profile?.weatherData
      }

      localStorage.setItem('userData', JSON.stringify(userData))
      localStorage.setItem('farmFields', JSON.stringify(data.farmFields))

      if (result.recommendations) {
        console.log('AI Recommendations:', result.recommendations)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Failed to save your profile. Please try again.')
    }
  }

  if (showOnboarding) {
    return (
      <ComprehensiveOnboarding
        onComplete={handleOnboardingComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero onGetStarted={handleStartOnboarding} />
      <Features />
      <Footer />
    </div>
  )
}