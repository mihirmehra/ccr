"use client"

import { useState, useEffect } from "react"
import {
  MapPin, Bed, Bath, Square, Building2,
  ChevronLeft, ChevronRight, Car, Compass, Layers,
  IndianRupee, Warehouse, Building, Home,
  Share2, Heart, Video, ImageIcon,
  Check, Phone, Mail, Calendar, ArrowLeft,
  Shield, Clock, TreePine, Dumbbell,
  Waves, Wifi, Zap, Wind, Sun, FileText,
  ExternalLink, Ruler, Grid3X3, Users, Mountain, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { generatePropertySchema } from "@/lib/schema-markup-generator"

import Link from "next/link"
import { cn, formatPriceToIndian } from "@/lib/utils"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"

// Import new modular components
import { HeroBanner } from "@/components/property/hero-banner"
import { ProjectHighlights } from "@/components/property/project-highlights"
import { UnitsSection } from "@/components/property/units-section"
import { FloorPlanTabs } from "@/components/property/floor-plan-tabs"
import { LocationConnectivity } from "@/components/property/location-connectivity"
import { DeveloperProjects } from "@/components/property/developer-projects"
import { PropertyFaq } from "@/components/property/property-faq"
import { EnquiryForm } from "@/components/property/enquiry-form"
import { BrochureDownload } from "@/components/property/brochure-download"

// Amenity icon mapping
const AMENITY_ICONS: Record<string, any> = {
  "swimming pool": Waves, "pool": Waves, "gym": Dumbbell, "fitness": Dumbbell,
  "wifi": Wifi, "internet": Wifi, "garden": TreePine, "park": TreePine,
  "parking": Car, "security": Shield, "power backup": Zap, "electricity": Zap,
  "ac": Wind, "air conditioning": Wind, "sunlight": Sun, "view": Mountain,
}

function getAmenityIcon(amenity: string) {
  const lowerAmenity = amenity.toLowerCase()
  for (const [key, Icon] of Object.entries(AMENITY_ICONS)) {
    if (lowerAmenity.includes(key)) return Icon
  }
  return Check
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [property, setProperty] = useState<any>(null)
  const [developer, setDeveloper] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const { addProperty: addToRecentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const { id } = await params
        const res = await fetch(`/api/properties/${id}`)
        const data = await res.json()
        setProperty(data.property)

        // Track as recently viewed
        if (data.property) {
          addToRecentlyViewed({
            id: data.property._id || id,
            slug: data.property.slug || id,
            name: data.property.property_name || "Property",
            thumbnail: data.property.main_thumbnail || "",
            price: formatPriceToIndian(data.property.lowest_price) || "",
            address: `${data.property.address || ""}, ${data.property.city || ""}`.replace(/^, |, $/g, ""),
          })
        }

        if (data.property?.developer_id) {
          const devRes = await fetch(`/api/admin/developers/${data.property.developer_id}`)
          if (devRes.ok) setDeveloper(await devRes.json())
        }
      } catch (error) {
        console.error("Error loading property:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProperty()
  }, [params, addToRecentlyViewed])

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="h-[60vh] bg-muted" />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Building2 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-1">Property Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">{"The property you're looking for doesn't exist."}</p>
          <Button asChild size="sm">
            <Link href="/properties"><ArrowLeft className="h-3 w-3 mr-1" />Browse Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = [property.main_banner || property.main_thumbnail, ...(property.multiple_images || [])].filter(Boolean)
  const schemaMarkup = property ? generatePropertySchema(property) : null

  const formatPrice = (price: number) => formatPriceToIndian(price)

  const getPropertyTypeIcon = () => {
    const type = property.property_type?.toLowerCase() || ""
    if (type.includes("apartment") || type.includes("flat")) return Building2
    if (type.includes("villa") || type.includes("house")) return Home
    if (type.includes("plot") || type.includes("land")) return Layers
    if (type.includes("office") || type.includes("commercial") || type.includes("sco")) return Building
    if (type.includes("warehouse")) return Warehouse
    return Home
  }
  const PropertyTypeIcon = getPropertyTypeIcon()

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "ready_to_move": "Ready to Move", "ready": "Ready", "under_construction": "Under Construction",
      "launched": "New Launch", "upcoming": "Upcoming", "resale": "Resale"
    }
    return labels[status] || status?.replace(/_/g, " ")
  }

  const isResidential = ["apartment", "villa", "house", "flat", "penthouse", "duplex", "studio", "independent"].some(
    t => property.property_type?.toLowerCase().includes(t)
  )

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length)

  // Create key-value specs to display
  const allSpecs = [
    { label: "Property Type", value: property.property_type, icon: Building2 },
    { label: "Listing Type", value: property.listing_type?.replace(/_/g, " "), icon: FileText },
    { label: "Category", value: property.property_category, icon: Grid3X3 },
    { label: "Project Status", value: getStatusLabel(property.project_status || property.possession_type), icon: Clock },
    { label: "Bedrooms", value: property.bedrooms, icon: Bed, show: isResidential && property.bedrooms > 0 },
    { label: "Bathrooms", value: property.bathrooms, icon: Bath, show: isResidential && property.bathrooms > 0 },
    { label: "Balconies", value: property.balconies_count, icon: Mountain, show: property.balconies_count > 0 },
    { label: "Carpet Area", value: property.carpet_area ? `${property.carpet_area} sqft` : null, icon: Square },
    { label: "Built-up Area", value: property.built_up_area ? `${property.built_up_area} sqft` : null, icon: Ruler },
    { label: "Super Area", value: property.super_area ? `${property.super_area} sqft` : null, icon: Layers },
    { label: "Area", value: property.area_sqft ? `${property.area_sqft} sqft` : null, icon: Square },
    { label: "Property Size", value: property.property_size, icon: Ruler },
    { label: "Facing", value: property.direction_facing?.replace(/_/g, " "), icon: Compass },
    { label: "Floor", value: property.floor_number ? `${property.floor_number}${property.total_floors ? ` of ${property.total_floors}` : ""}` : null, icon: Layers },
    { label: "Total Floors", value: property.total_floors, icon: Building },
    { label: "Parking", value: property.parking_count ? `${property.parking_count} (${property.parking_type || "Open"})` : null, icon: Car },
    { label: "Furnished", value: property.furnished_type?.replace(/_/g, " "), icon: Home },
    { label: "Possession", value: property.possession || property.possession_year_quarter, icon: Calendar },
    { label: "Developer", value: property.developer_name || developer?.name, icon: Building },
    { label: "Brand Collection", value: property.brand_collection, icon: FileText },
    { label: "Target Segment", value: property.target_segment, icon: Users },
    { label: "Total Towers", value: property.total_towers, icon: Building },
    { label: "Total Units", value: property.total_units, icon: Grid3X3 },
    { label: "Total Acreage", value: property.total_acreage ? `${property.total_acreage} acres` : null, icon: Ruler },
    { label: "Booking Amount", value: property.booking_amount ? `${formatPrice(property.booking_amount)}` : null, icon: IndianRupee },
    { label: "Payment Plan", value: property.payment_plan, icon: FileText },
  ].filter(spec => spec.value && (spec.show === undefined || spec.show))

  // Combine all amenities for display
  const allAmenities = [
    ...(property.amenities || []),
    ...(property.facilities || []),
    ...(property.luxury_amenities || [])
  ]

  return (
    <main className="min-h-screen bg-background">
      {schemaMarkup && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      )}

      {/* Section 1: Hero Banner */}
      <HeroBanner property={property} />

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/properties" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="hidden sm:block">
              <p className="font-semibold text-sm line-clamp-1">{property.property_name}</p>
              <p className="text-xs text-muted-foreground">{property.city}, {property.state}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isLiked ? "bg-rose-100 text-rose-500" : "hover:bg-muted"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <Button size="sm" asChild>
              <a href="#enquiry">Enquire Now</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Section 2: About Section */}
      {(property.about_project || property.short_description || property.long_description) && (
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">About {property.property_name}</h2>
              </div>
            </div>
            <div className="max-w-none">
              {property.about_project ? (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.about_project}
                </p>
              ) : (
                <>
                  {property.short_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{property.short_description}</p>
                  )}
                  {property.long_description && (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.long_description}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Project Highlights */}
      <ProjectHighlights highlights={property.project_highlights || []} />

      {/* Section 4: Property Details */}
      {allSpecs.length > 0 && (
        <section className="py-8 md:py-12 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">Property Details</h2>
                <p className="text-muted-foreground text-xs">Complete specifications</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {allSpecs.map((spec, idx) => (
                <div key={idx} className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors">
                  <spec.icon className="h-4 w-4 text-primary mb-1.5" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{spec.label}</p>
                  <p className="text-xs font-semibold text-foreground capitalize truncate">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* RERA Info */}
            {(property.rera_registered || property.rera_id) && (
              <div className="mt-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-400">RERA Registered</h3>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {property.rera_id && (
                    <p><span className="text-muted-foreground">RERA ID:</span> <span className="font-medium">{property.rera_id}</span></p>
                  )}
                  {property.rera_website_link && (
                    <a href={property.rera_website_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <ExternalLink className="h-3 w-3" />View on RERA Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section 5: Units Specified */}
      <UnitsSection units={property.units} configurations={property.configurations} />

      {/* Section 6: Amenities */}
      {allAmenities.length > 0 && (
        <section className="py-10 md:py-14 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02]" />

          <div className="max-w-6xl mx-auto px-4 relative">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold mb-3 tracking-wide">
                <Check className="h-3 w-3" />
                WORLD-CLASS LIVING
              </div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">Amenities & Facilities</h2>
              <p className="text-muted-foreground text-xs mt-1">{allAmenities.length} Premium amenities for modern lifestyle</p>
            </div>

            {/* Amenities Grid - Compact Masonry Style */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {allAmenities.map((amenity: string, idx: number) => {
                const Icon = getAmenityIcon(amenity)
                const isHighlight = idx < 100

                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200",
                      isHighlight
                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40"
                        : "bg-card border border-border hover:border-primary/30 hover:shadow-sm",
                      "hover:-translate-y-0.5"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      isHighlight
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">{amenity}</span>

                    {/* Checkmark for highlights */}
                    {isHighlight && (
                      <Check className="h-3 w-3 text-primary ml-auto flex-shrink-0 opacity-60" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Bottom decorative line */}
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </div>
        </section>
      )}

      {/* Section 7: Gallery */}
      {images.length > 1 && (
        <section className="py-10 md:py-14 bg-gradient-to-b from-muted/30 to-muted/50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

          <div className="max-w-6xl mx-auto px-4 relative">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                  <ImageIcon className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground">Project Gallery</h2>
                  <p className="text-muted-foreground text-xs">{images.length} Images</p>
                </div>
              </div>

              {property.walkthrough_video && (
                <a
                  href={property.walkthrough_video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Video className="h-3 w-3" />
                  <span>Watch Video</span>
                </a>
              )}
            </div>

            {/* Gallery Grid - Bento Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {images.slice(0, 8).map((img: string, idx: number) => {
                // First image is larger
                const isLarge = idx === 0

                return (
                  <button
                    key={idx}
                    onClick={() => { setActiveImage(idx); setShowFullscreen(true); }}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border-2 border-transparent hover:border-primary/50 transition-all duration-300",
                      isLarge ? "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-square" : "aspect-[4/3]"
                    )}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* View icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <ImageIcon className="h-4 w-4 text-foreground" />
                      </div>
                    </div>

                    {/* Image number badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-medium">
                      {idx + 1}/{images.length}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Show more if there are more images */}
            {images.length > 8 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => { setActiveImage(0); setShowFullscreen(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  View All {images.length} Images
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section 8: Floor Plans */}
      <FloorPlanTabs floorPlans={property.floor_plans || []} configurations={property.configurations} />

      {/* Section 9: Location & Connectivity */}
      <LocationConnectivity
        connectivity={property.location_connectivity}
        nearby={property.nearby}
        googleMapLink={property.google_map_link}
        address={property.address}
        city={property.city}
        state={property.state}
      />

      {/* Section 10: About Developer */}
      <DeveloperProjects
        developerId={property.developer_id}
        developerSlug={developer?.slug}
        developerName={property.developer_name || developer?.name}
        excludePropertyId={property._id}
      />

      {/* Section 11: Download Brochure */}
      <BrochureDownload brochureUrl={property.brochure_pdf} propertyName={property.property_name} />

      {/* Section 12: FAQs */}
      <PropertyFaq faqs={property.faqs || []} />

      {/* Section 13: Enquiry Form */}
      <div id="enquiry">
        <EnquiryForm
          propertyId={property._id}
          propertyName={property.property_name}
          propertySlug={property.slug}
        />
      </div>

      {/* Fullscreen Gallery */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
          >
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={images[activeImage]}
            alt={property.property_name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}
    </main>
  )
}
