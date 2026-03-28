import { MongoClient, ObjectId } from "mongodb"
import { requireAdmin } from "@/lib/auth"

const mongoUrl = process.env.MONGODB_URI || ""

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    if (!mongoUrl) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = new MongoClient(mongoUrl)

    try {
      await client.connect()
      const db = client.db("countryroof")
      const collection = db.collection("blog_posts")

      let post
      if (ObjectId.isValid(id)) {
        post = await collection.findOne({ _id: new ObjectId(id) })
      }
      
      if (!post) {
        post = await collection.findOne({ slug: id })
      }

      if (!post) {
        return new Response(JSON.stringify({ error: "Blog post not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Serialize MongoDB ObjectId to string
      const serializedPost = {
        ...post,
        _id: post._id.toString(),
      }

      return new Response(JSON.stringify({ post: serializedPost }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } finally {
      await client.close()
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unauthorized"
    const statusCode = errorMessage === "Unauthorized" ? 401 : 500

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    if (!mongoUrl) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await request.json()
    const {
      title,
      excerpt,
      content,
      category,
      author,
      readTime,
      cover_image,
      banner_image,
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image,
      tags,
      is_published,
    } = body

    if (!title || !excerpt || !content || !author) {
      return new Response(JSON.stringify({ error: "Missing required fields: title, excerpt, content, and author are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = new MongoClient(mongoUrl)

    try {
      await client.connect()
      const db = client.db("countryroof")
      const collection = db.collection("blog_posts")

      // Find the existing post
      let existingPost
      if (ObjectId.isValid(id)) {
        existingPost = await collection.findOne({ _id: new ObjectId(id) })
      }
      
      if (!existingPost) {
        existingPost = await collection.findOne({ slug: id })
      }

      if (!existingPost) {
        return new Response(JSON.stringify({ error: "Blog post not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Generate new slug if title changed
      let slug = existingPost.slug
      if (title !== existingPost.title) {
        slug = slugify(title)
        // Check for existing slug (excluding current post)
        const duplicateSlug = await collection.findOne({ 
          slug, 
          _id: { $ne: existingPost._id } 
        })
        if (duplicateSlug) {
          slug = `${slug}-${Date.now()}`
        }
      }

      // Handle category - support both string and array formats
      const categoryValue = Array.isArray(category) ? category : (category ? [category] : ["general"])

      const result = await collection.updateOne(
        { _id: existingPost._id },
        {
          $set: {
            title,
            slug,
            excerpt,
            content,
            category: categoryValue,
            author,
            readTime: Number.parseInt(readTime) || 5,
            read_time: Number.parseInt(readTime) || 5,
            cover_image: cover_image || null,
            banner_image: banner_image || null,
            meta_title: meta_title || title,
            meta_description: meta_description || excerpt.substring(0, 160),
            meta_keywords: meta_keywords || "",
            og_title: og_title || title,
            og_description: og_description || excerpt,
            og_image: og_image || banner_image || cover_image || null,
            tags: Array.isArray(tags) ? tags : [],
            is_published: is_published !== false,
            published: is_published !== false,
            updatedAt: new Date(),
          },
        }
      )

      if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: "Blog post not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Blog post updated successfully",
          slug,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("[v0] Error updating blog post:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update blog post"
    const statusCode = errorMessage === "Unauthorized" ? 401 : 500

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params

    if (!mongoUrl) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = new MongoClient(mongoUrl)

    try {
      await client.connect()
      const db = client.db("countryroof")
      const collection = db.collection("blog_posts")

      let result
      if (ObjectId.isValid(id)) {
        result = await collection.deleteOne({ _id: new ObjectId(id) })
      }
      
      if (!result || result.deletedCount === 0) {
        result = await collection.deleteOne({ slug: id })
      }

      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: "Blog post not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Blog post deleted successfully",
        }),
        {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      )
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("[v0] Error deleting blog post:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete blog post"
    const statusCode = errorMessage === "Unauthorized" ? 401 : 500

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}
