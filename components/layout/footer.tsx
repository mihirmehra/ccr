"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Phone, Mail, ChevronDown, Send } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: formData.message || "Callback request from footer form",
          source: "footer_callback",
        }),
      })

      if (!res.ok) throw new Error("Failed to submit")

      setFormSubmitted(true)
      setTimeout(() => {
        setFormData({ name: "", phone: "", message: "" })
        setFormSubmitted(false)
      }, 3000)
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About CountryRoof", href: "/about" },
    { name: "Our Services", href: "/services" },
    { name: "All Properties", href: "/properties" },
    { name: "Real Estate Blog", href: "/blog" },
    { name: "Career", href: "/career" },
    { name: "Contact", href: "/contact" },
  ]

  const primeLocations = [
    { name: "Properties on Golf Course Road", href: "/properties?location=golf-course-road" },
    { name: "Projects on Dwarka Expressway", href: "/properties?location=dwarka-expressway" },
    { name: "Luxury Homes in New Gurugram", href: "/properties?location=new-gurugram" },
    { name: "Apartments on SPR", href: "/properties?location=spr" },
    { name: "Golf Course Extension Road", href: "/properties?location=golf-course-extension" },
    { name: "Properties on Sohna Road", href: "/properties?location=sohna-road" },
  ]

  const propertyTypes = [
    { name: "Luxury Apartments", href: "/properties?category=luxury" },
    { name: "Premium Penthouses", href: "/properties?category=penthouse" },
    { name: "SCO Plots", href: "/properties?category=sco" },
    { name: "Commercial Properties", href: "/properties?category=commercial" },
    { name: "Residential Plots", href: "/properties?category=plots" },
    { name: "Furnished Flats", href: "/properties?category=furnished" },
  ]

  const toolsServices = [
    { name: "EMI Calculator", href: "/tools/emi-calculator" },
    { name: "QR Code Generator", href: "/tools/qr-generator" },
    { name: "Gurugram Master Plan 2031", href: "/gurugram-master-plan" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms-and-conditions" },
    { name: "Disclaimer", href: "/disclaimer" },
  ]

  const FooterSection = ({
    title,
    items,
    sectionKey,
  }: { title: string; items: { name: string; href: string }[]; sectionKey: string }) => {
    const isExpanded = expandedSections[sectionKey]

    return (
      <div className="border-b border-gray-200 md:border-b-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 py-3 md:py-0 text-sm font-semibold text-[#002366] hover:text-red-500 transition-colors"
        >
          {title}
          <ChevronDown size={16} className={`md:hidden transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        <ul
          className={`space-y-1.5 overflow-hidden transition-all duration-300 md:block ${isExpanded ? "max-h-96" : "max-h-0 md:max-h-96"}`}
        >
          {items.map((item, idx) => (
            <li key={idx} className="pt-2 md:pt-0">
              <Link href={item.href} className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <footer className="w-full bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">

        {/* Top Section: Contact & Unique Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 pb-12 border-b border-gray-200">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#002366] mb-4">About Country Roof</h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                Gurugram-based real estate advisory firm specializing in luxury residential and high-growth commercial investments. We assist elite homebuyers and investors in identifying premium properties across Golf Course Road, Dwarka Expressway, New Gurugram, and SPR. Our approach combines deep local expertise, verified inventory, and transparent advisory services to ensure secure and rewarding property decisions.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#002366] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-white" />
                </div>
                <a href="tel:+919873702365" className="text-sm text-gray-700 hover:text-red-500 transition-colors">
                  +91 98737-02365
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#002366] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-white" />
                </div>
                <a
                  href="mailto:info@countryroof.com"
                  className="text-sm text-gray-700 hover:text-red-500 transition-colors"
                >
                  info@countryroof.com
                </a>
              </div>
            </div>
          </div>

          {/* Unique Enquiry Form */}
          <div className="bg-gradient-to-br from-[#002366] to-[#003d99] rounded-2xl p-8 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">Get Instant Callback</h3>
            <p className="text-sm text-blue-100 mb-6">
              Get expert advice on your property investment. Our team will contact you within 30 minutes.
            </p>

            {formSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mb-4">
                  <Send size={28} className="text-white" />
                </div>
                <p className="text-lg font-semibold mb-1">Thank you!</p>
                <p className="text-sm text-blue-100">We'll contact you soon</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-100 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-100 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <span>{formLoading ? "Submitting..." : "Get Callback"}</span>
                  {!formLoading && <Send size={16} />}
                </button>
                {formError && (
                  <p className="text-xs text-red-300 text-center">{formError}</p>
                )}
                <p className="text-xs text-blue-100 text-center">Get expert advice on your property investment.</p>
              </form>
            )}
          </div>
        </div>

        {/* Links Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Quick Links */}
          <div>
            <FooterSection title="Quick Links" items={quickLinks} sectionKey="quickLinks" />
          </div>

          {/* Prime Locations */}
          <div>
            <FooterSection title="Prime Locations" items={primeLocations} sectionKey="primeLocations" />
          </div>

          {/* Property Types */}
          <div>
            <FooterSection title="Property Types" items={propertyTypes} sectionKey="propertyTypes" />
          </div>

          {/* Tools & Services */}
          <div>
            <FooterSection title="Tools & Services" items={toolsServices} sectionKey="toolsServices" />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600 text-center md:text-left">
              © {currentYear} countryroof.com All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/site-map" className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
