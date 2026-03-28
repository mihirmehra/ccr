"use client"

import { useState } from "react"
import { Layers, ZoomIn, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloorPlanTabsProps {
  floorPlans: string[]
  configurations?: Array<{
    type: string
    floor_plan_image?: string
  }>
}

export function FloorPlanTabs({ floorPlans, configurations }: FloorPlanTabsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  // Combine floor plans from both sources
  const plans: Array<{ label: string; image: string }> = []

  // Add configuration floor plans with labels
  configurations?.forEach(config => {
    if (config.floor_plan_image) {
      plans.push({
        label: config.type,
        image: config.floor_plan_image
      })
    }
  })

  // Add standalone floor plans
  floorPlans?.forEach((plan, index) => {
    // Avoid duplicates
    if (!plans.some(p => p.image === plan)) {
      plans.push({
        label: `Plan ${plans.length + 1}`,
        image: plan
      })
    }
  })

  if (plans.length === 0) return null

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Floor Plans</h2>
        </div>

        {/* Tab Navigation */}
        {plans.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {plans.map((plan, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeTab === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {plan.label}
              </button>
            ))}
          </div>
        )}

        {/* Active Floor Plan */}
        <div className="relative bg-card border border-border rounded-xl overflow-hidden">
          <div className="aspect-[4/3] md:aspect-[16/9] relative">
            <img
              src={plans[activeTab].image}
              alt={`Floor Plan - ${plans[activeTab].label}`}
              className="w-full h-full object-contain p-4"
            />
            
            {/* Zoom Button */}
            <button
              onClick={() => setShowLightbox(true)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition-colors"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          {/* Plan Label */}
          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-sm font-medium text-foreground">{plans[activeTab].label}</p>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {plans.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {plans.map((plan, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  activeTab === index
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={plan.image}
                  alt={plan.label}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={plans[activeTab].image}
            alt={`Floor Plan - ${plans[activeTab].label}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
