"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Building2, Award, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Developer {
  _id: string
  name: string
  slug?: string
  logo_url?: string
  property_count: number
}

export default function FeaturedDevelopers() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        // Fetch developers with property count
        const response = await fetch("/api/developers")
        const data = await response.json()
        
        // Filter to only show developers with at least 1 property and sort by property count
        const developersWithProperties = (Array.isArray(data) ? data : [])
          .filter((dev: Developer) => dev.property_count > 0)
          .sort((a: Developer, b: Developer) => b.property_count - a.property_count)
        
        setDevelopers(developersWithProperties)
      } catch (error) {
        console.error("Error fetching developers:", error)
        setDevelopers([])
      } finally {
        setLoading(false)
      }
    }

    fetchDevelopers()
  }, [])

  // Auto-scroll animation
  useEffect(() => {
    if (!scrollRef.current || developers.length < 4 || isPaused) return

    const scrollContainer = scrollRef.current
    let animationId: number
    let scrollPos = 0
    const scrollSpeed = 0.5

    const animate = () => {
      scrollPos += scrollSpeed
      if (scrollPos >= scrollContainer.scrollWidth / 2) {
        scrollPos = 0
      }
      scrollContainer.scrollLeft = scrollPos
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [developers, isPaused])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  if (loading) {
    return (
      <section className="w-full py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-4" />
            <div className="h-4 w-96 bg-gray-200 rounded mx-auto mb-12" />
            <div className="flex gap-6 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (developers.length === 0) return null

  // Duplicate developers for infinite scroll effect
  const duplicatedDevelopers = [...developers, ...developers]

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/5 rounded-full">
            <Award className="text-primary" size={20} />
            <span className="text-primary font-semibold text-sm tracking-wide">TOP REAL ESTATE DEVELOPERS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {"Gurugram's Leading Developers"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted partnerships with reputed developers known for quality construction and timely delivery
          </p>
        </div>

        {/* Animated Logo Carousel */}
        <div className="relative group">
          {/* Gradient Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200",
              "flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "hover:bg-gray-50"
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200",
              "flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "hover:bg-gray-50"
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {duplicatedDevelopers.map((developer, index) => (
              <Link
                key={`${developer._id}-${index}`}
                href={`/properties?developer_name=${encodeURIComponent(developer.name)}`}
                className={cn(
                  "flex-shrink-0 w-48 group/card",
                  "bg-white rounded-2xl p-6",
                  "border border-gray-100 shadow-sm",
                  "hover:shadow-xl hover:border-primary/20 hover:-translate-y-1",
                  "transition-all duration-300 ease-out"
                )}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Logo Container */}
                  <div className={cn(
                    "w-24 h-24 rounded-xl mb-4 overflow-hidden",
                    "bg-gradient-to-br from-gray-50 to-gray-100",
                    "flex items-center justify-center",
                    "group-hover/card:scale-105 transition-transform duration-300"
                  )}>
                    {developer.logo_url ? (
                      <img
                        src={developer.logo_url}
                        alt={developer.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Developer Name */}
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1 group-hover/card:text-primary transition-colors">
                    {developer.name}
                  </h3>

                  {/* Property Count Badge */}
                  <div className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full",
                    "bg-primary/5 text-primary text-xs font-medium",
                    "group-hover/card:bg-primary group-hover/card:text-white",
                    "transition-colors duration-300"
                  )}>
                    <Building2 className="h-3 w-3" />
                    {developer.property_count} {developer.property_count === 1 ? "Project" : "Projects"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            href="/developers"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3",
              "bg-primary text-white rounded-full",
              "font-medium text-sm",
              "hover:bg-primary/90 hover:gap-3",
              "transition-all duration-300 shadow-lg shadow-primary/20"
            )}
          >
            View All Developers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
