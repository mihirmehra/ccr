import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Search, FileCheck, Users, TrendingUp, Shield, Home, Briefcase } from "lucide-react"

export const metadata: Metadata = {
  title: "Real Estate Services in Gurugram | CountryRoof",
  description:
    "Comprehensive real estate services including property advisory, investment consulting, legal assistance, and property management in Gurugram.",
  openGraph: {
    title: "Real Estate Services | CountryRoof",
    description: "Expert real estate advisory and consulting services in Gurugram.",
    url: "https://countryroof.com/services",
  },
}

const services = [
  {
    id: "advisory",
    title: "Property Advisory",
    description: "Expert guidance for buying, selling, and investing in real estate",
    icon: Search,
    details: [
      "Personalized property recommendations",
      "Market analysis and insights",
      "Price negotiation support",
      "End-to-end transaction assistance",
    ],
  },
  {
    id: "investment",
    title: "Investment Consulting",
    description: "Strategic advice for maximizing returns on property investments",
    icon: TrendingUp,
    details: [
      "ROI analysis and projections",
      "Portfolio diversification strategies",
      "Pre-launch and new project opportunities",
      "Commercial vs residential guidance",
    ],
  },
  {
    id: "legal",
    title: "Legal Assistance",
    description: "Comprehensive legal support for property transactions",
    icon: FileCheck,
    details: [
      "Document verification and due diligence",
      "Title clearance checks",
      "Agreement drafting and review",
      "RERA compliance verification",
    ],
  },
  {
    id: "home-loans",
    title: "Home Loan Assistance",
    description: "Simplified home loan processing with multiple bank partners",
    icon: Home,
    details: [
      "Loan eligibility assessment",
      "Best interest rate comparison",
      "Documentation support",
      "Quick loan approval process",
    ],
  },
  {
    id: "nri",
    title: "NRI Services",
    description: "Dedicated support for Non-Resident Indians investing in Indian real estate",
    icon: Users,
    details: [
      "Virtual property tours",
      "Power of Attorney assistance",
      "Regulatory compliance guidance",
      "Property management services",
    ],
  },
  {
    id: "commercial",
    title: "Commercial Real Estate",
    description: "Expert services for commercial property requirements",
    icon: Briefcase,
    details: [
      "Office space solutions",
      "Retail space leasing",
      "Warehouse and industrial properties",
      "Co-working space options",
    ],
  },
  {
    id: "builder",
    title: "Builder Partnerships",
    description: "Direct partnerships with top developers for exclusive deals",
    icon: Building2,
    details: [
      "Exclusive project launches",
      "Direct builder pricing",
      "Early bird offers access",
      "Channel partner benefits",
    ],
  },
  {
    id: "after-sales",
    title: "After-Sales Support",
    description: "Continued assistance even after property purchase",
    icon: Shield,
    details: [
      "Registration and possession support",
      "Interior design referrals",
      "Rental management",
      "Resale assistance",
    ],
  },
]

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="w-full py-16 md:py-24 px-4 bg-gradient-to-br from-[#002366] to-[#003d99] text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">Our Services</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Comprehensive real estate solutions tailored to your needs. From property search to post-purchase support, we're with you every step of the way.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="w-full py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all p-6 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{service.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 pl-16">
                    {service.details.map((detail, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">-</span>
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="w-full py-16 px-4 bg-muted/30 border-t border-border">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">How We Work</h2>
              <p className="text-muted-foreground">Our streamlined process ensures a smooth property buying experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Consultation", desc: "Understand your requirements and preferences" },
                { step: "02", title: "Property Search", desc: "Curate properties matching your criteria" },
                { step: "03", title: "Site Visits", desc: "Accompany you for property inspections" },
                { step: "04", title: "Transaction Support", desc: "Assist with negotiation and paperwork" },
              ].map((item, idx) => (
                <div key={idx} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 px-4 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Ready to Find Your Perfect Property?</h2>
            <p className="text-muted-foreground">
              Get in touch with our expert team for personalized assistance with your real estate needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/contact">Get Free Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/properties">Browse Properties</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
