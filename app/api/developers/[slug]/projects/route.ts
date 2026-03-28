import { getDatabase } from "@/lib/mongodb"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "4")
    const excludeId = searchParams.get("exclude") // Exclude current property

    const db = await getDatabase()

    // Find developer by slug or ID
    let developer
    if (ObjectId.isValid(slug)) {
      developer = await db.collection("developers").findOne({ 
        $or: [{ _id: new ObjectId(slug) }, { slug }] 
      })
    } else {
      developer = await db.collection("developers").findOne({ slug })
    }

    if (!developer) {
      return NextResponse.json({ error: "Developer not found" }, { status: 404 })
    }

    // Build query for properties by this developer
    const query: Record<string, any> = {
      $or: [
        { developer_name: developer.name },
        { developer_id: developer._id }
      ]
    }

    // Exclude current property if specified
    if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) }
    }

    // Find properties by developer
    const properties = await db
      .collection("properties")
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .project({
        _id: 1,
        property_name: 1,
        slug: 1,
        main_thumbnail: 1,
        city: 1,
        state: 1,
        lowest_price: 1,
        max_price: 1,
        property_type: 1,
        possession: 1,
        configurations: 1,
        units: 1
      })
      .toArray()

    // Serialize ObjectIds to strings
    const serializedProperties = properties.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }))

    const serializedDeveloper = {
      ...developer,
      _id: developer._id.toString(),
    }

    return NextResponse.json({
      developer: serializedDeveloper,
      projects: serializedProperties,
      total: serializedProperties.length
    })
  } catch (error) {
    console.error("[v0] Error fetching developer projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch developer projects" },
      { status: 500 }
    )
  }
}
