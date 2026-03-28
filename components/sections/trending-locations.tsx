"use client"

import Link from "next/link"
import { MapPin, TrendingUp } from "lucide-react"

const trendingLocations = [
  {
    name: "Golf Course Road",
    properties: "200+ Properties",
    image: "/locations/golf-course-road.jpg",
    searchParam: "Golf Course Road",
  },
  {
    name: "Golf Course Extn Road",
    properties: "160+ Properties",
    image: "/locations/golf-course-extension.jpg",
    searchParam: "Golf Course Extension",
  },
  {
    name: "Dwarka Expressway",
    properties: "180+ Properties",
    image: "/locations/dwarka-expressway.jpg",
    searchParam: "Dwarka Expressway",
  },
  {
    name: "Southern Peripheral Road",
    properties: "90+ Properties",
    image: "/locations/southern-peripheral-road.jpg",
    searchParam: "Southern Peripheral Road",
  },
  {
    name: "Sohna",
    properties: "150+ Properties",
    image: "/locations/sohna.jpg",
    searchParam: "Sohna",
  },
  {
    name: "New Gurgaon",
    properties: "120+ Properties",
    image: "/locations/new-gurgaon.jpg",
    searchParam: "New Gurgaon",
  },
  {
    name: "NH-48",
    properties: "110+ Properties",
    image: "/locations/nh-48.jpg",
    searchParam: "NH-48",
  },
  {
    name: "Manesar",
    properties: "80+ Properties",
    image: "/locations/manesar.jpg",
    searchParam: "Manesar",
  },
]

export default function TrendingLocations() {
  return (
    <section className="py-16 px-4 md:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-3">
          <TrendingUp className="h-8 w-8 text-[#002366]" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#002366] text-center">Prime Investment Corridors</h2>
        </div>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Invest in rapidly developing Gurugram areas with strong appreciation potential
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingLocations.map((location) => (
            <Link
              key={location.name}
              href={`/properties?location=${encodeURIComponent(location.searchParam)}`}
              className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-white"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={location.image || "/placeholder.svg"}
                  alt={location.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-bold text-white">{location.name}</h3>
                </div>
                <p className="text-sm text-white/90">{location.properties}</p>
              </div>
              <div className="absolute top-3 right-3 bg-[#002366] text-white text-xs font-semibold px-3 py-1 rounded-full">
                Trending
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
