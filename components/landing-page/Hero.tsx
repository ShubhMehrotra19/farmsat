"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Leaf, ShieldCheck, Sprout } from "lucide-react"

export function Hero({ onGetStarted }: { onGetStarted: () => void }) {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-amber-50/30 to-white min-h-[90vh] flex items-center">

            {/* Organic Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:w-1/2 text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-sm font-semibold mb-6">
                            <Leaf className="w-4 h-4" />
                            <span>Your Trusted Farming Partner</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-emerald-950 mb-6 leading-[1.1]">
                            Kisan<span className="text-emerald-600">Mitr</span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-gray-600 font-light mb-8 max-w-xl leading-relaxed">
                            Empowering Indian farmers with precision satellite data, weather insights, and AI-driven advice for better yields.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                onClick={onGetStarted}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white text-lg px-8 py-7 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
                            >
                                Join KisanMitr
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="mt-10 flex items-center gap-8 text-gray-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                Trusted by 10k+ Farmers
                            </div>
                            <div className="flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-emerald-600" />
                                Scientific Accuracy
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Content - More Organic/Solid */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="relative z-10 bg-white p-2 rounded-2xl shadow-2xl rotate-3 transform hover:rotate-2 transition-transform duration-500">
                            {/* Ideally this would be a real image, using a placeholder gradient for now that looks professional */}
                            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-emerald-100 to-amber-50 flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-58197bd47d26?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-90 mix-blend-overlay"></div>
                                <div className="absolute inset-0 bg-emerald-900/10"></div>
                                <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-lg max-w-xs">
                                    <h3 className="text-emerald-900 font-bold text-lg mb-2">Live Field Analysis</h3>
                                    <div className="flex justify-between text-xs text-gray-600 mb-4 border-b pb-2">
                                        <span>Soil Moisture</span>
                                        <span className="text-emerald-600 font-bold">Good</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
                                        </div>
                                        <div className="text-xs text-right text-emerald-700">75% Optimal</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Organic Decor Elements */}
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
