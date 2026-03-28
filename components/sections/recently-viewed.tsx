"use client"

import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { MapPin, Clock, X, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RecentlyViewed() {
  const { items, clearAll, hasItems } = useRecentlyViewed()

  if (!hasItems) return null

  return (
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Recently Viewed</h2>
              <p className="text-xs text-muted-foreground">
                Properties you visited recently
              </p>
            </div>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Clear recently viewed"
          >
            <X className="h-3.5 w-3.5" />
            Clear All
          </button>
        </div>

        {/* Horizontal Scroll Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/properties/${item.slug || item.id}`}
              className="flex-shrink-0 w-[220px] bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
            >
              {/* Thumbnail */}
              <div className="relative h-32 bg-muted overflow-hidden">
                <img
                  src={item.thumbnail || "/placeholder.jpg"}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">{item.address}</span>
                </div>
                <p className="text-sm font-bold text-primary">{item.price}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="flex justify-center mt-6">
          <Button asChild variant="outline" size="sm" className="group">
            <Link href="/properties" className="flex items-center gap-2">
              Browse All Properties
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
