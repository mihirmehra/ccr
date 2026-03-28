import { getDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Configure nodemailer transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "587")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn("[v0] SMTP not configured - emails will not be sent")
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { 
      name, 
      email, 
      phone, 
      message, 
      property_id, 
      property_name,
      property_slug 
    } = body

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        )
      }
    }

    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      )
    }

    // Save enquiry to database
    const db = await getDatabase()
    const enquiry = {
      name,
      email: email || "",
      phone,
      message: message || "",
      property_id: property_id || "",
      property_name: property_name || "",
      property_slug: property_slug || "",
      source: "property_detail_page",
      status: "new",
      created_at: new Date(),
      updated_at: new Date(),
    }

    const result = await db.collection("enquiries").insertOne(enquiry)

    // Send email notification
    const transporter = getTransporter()
    if (transporter) {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER

      try {
        await transporter.sendMail({
          from: `"Countryroof Enquiries" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `New Property Enquiry: ${property_name || "General"}`,
          html: `
            <h2>New Property Enquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
            ${property_name ? `<p><strong>Property:</strong> ${property_name}</p>` : ""}
            ${property_slug ? `<p><strong>Link:</strong> <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://countryroof.com"}/properties/${property_slug}">View Property</a></p>` : ""}
            ${message ? `<p><strong>Message:</strong></p><p>${message}</p>` : ""}
            <hr>
            <p><small>Received at: ${new Date().toLocaleString()}</small></p>
          `,
        })
      } catch (emailError) {
        console.error("[v0] Failed to send email notification:", emailError)
        // Don't fail the request if email fails - enquiry is still saved
      }
    }

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully",
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("[v0] Property enquiry error:", error)
    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 }
    )
  }
}
