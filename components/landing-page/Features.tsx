"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CloudSun, Droplets, Map, Sprout } from "lucide-react"

const features = [
    {
        title: "Crop Health",
        description: "Real-time vegetation indices (NDVI) to spot stress early.",
        icon: Sprout,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        title: "Weather Intelligence",
        description: "Localized forecasts to plan your sowing and harvesting.",
        icon: CloudSun,
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
    {
        title: "Smart Irrigation",
        description: "Soil moisture tracking to save water and improve yield.",
        icon: Droplets,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        title: "Field Monitoring",
        description: "GPS-enabled field mapping for precise farm management.",
        icon: Map,
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
]

export function Features() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl mb-4 font-serif">
                        Why Choose <span className="notranslate">KisanMitr</span>?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Combining traditional farming wisdom with cutting-edge satellite technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="group relative bg-white p-6 rounded-2xl border border-gray-100 hover:border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300">
                                <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
