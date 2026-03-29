import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { MongoClient } from "mongodb"
import Link from "next/link"
import { Calendar, Clock, User, Tag, ChevronRight, ArrowLeft } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { generateBlogSchema } from "@/lib/schema-markup-generator"
import {
  TableOfContents,
  ShareButtons,
  ReadingProgressBar,
  BackToTop
} from "./_blog-detail-components"

const mongoUrl = process.env.MONGODB_URI || ""

interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  banner_image?: string
  cover_image?: string
  og_image?: string
  author?: string
  publication_date?: string
  createdAt?: string
  category?: string
  categories?: string[]
  tags?: string[]
  readTime?: string
  read_time?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  og_title?: string
  og_description?: string
  is_published?: boolean
  published?: boolean
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (!mongoUrl) return null
  const client = new MongoClient(mongoUrl)
  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("blog_posts")
    const post = await collection.findOne({
      slug,
      $or: [{ is_published: true }, { published: true }]
    })
    if (!post) return null
    return {
      ...post,
      _id: post._id?.toString(),
      author: post.author?.toString?.() || post.author,
      tags: Array.isArray(post.tags) ? post.tags : [],
      readTime: post.readTime?.toString() || post.read_time?.toString() || "5"
    } as BlogPost
  } finally {
    await client.close()
  }
}

async function getRelatedPosts(category: string, currentSlug: string): Promise<BlogPost[]> {
  if (!mongoUrl) return []
  const client = new MongoClient(mongoUrl)
  try {
    await client.connect()
    const db = client.db("countryroof")
    const collection = db.collection("blog_posts")
    const posts = await collection
      .find({
        $or: [{ is_published: true }, { published: true }],
        slug: { $ne: currentSlug },
        ...(category ? { category } : {})
      })
      .limit(3)
      .project({
        title: 1,
        slug: 1,
        excerpt: 1,
        banner_image: 1,
        cover_image: 1,
        author: 1,
        publication_date: 1,
        createdAt: 1,
        readTime: 1,
        read_time: 1,
        category: 1
      })
      .toArray()
    return posts.map((p) => ({
      ...p,
      _id: p._id?.toString(),
      author: p.author?.toString?.() || p.author
    })) as BlogPost[]
  } finally {
    await client.close()
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: "Post not found" }
  return {
    title: post.meta_title || `${post.title} | CountryRoof Blog`,
    description: post.meta_description || post.excerpt,
    keywords: post.meta_keywords || post.tags?.join(", "),
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt,
      url: `https://countryroof.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publication_date,
      authors: [post.author?.toString() || "CountryRoof"],
      images: [post.og_image || post.banner_image || post.cover_image || ""].filter(Boolean)
    },
    twitter: {
      card: "summary_large_image",
      title: post.og_title || post.title,
      description: post.og_description || post.excerpt,
      images: [post.og_image || post.banner_image || post.cover_image || ""].filter(Boolean)
    }
  }
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post.category || "", slug)

  const publishDate = new Date(
    post.publication_date || post.createdAt || Date.now()
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  const schemaMarkup = generateBlogSchema(post, post.author || "CountryRoof")
  const canonicalUrl = `https://countryroof.com/blog/${slug}`
  const heroImage = post.banner_image || post.cover_image || post.og_image

  return (
    <>
      <Header />

      {/* Reading progress bar */}
      <ReadingProgressBar />

      <main className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />

        {/* ────────────────────────────────────── HERO ── */}
        <section className="relative w-full bg-gradient-to-b from-muted/60 to-background border-b border-border overflow-hidden">
          {/* Background blur image */}
          {heroImage && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5 blur-2xl scale-105"
              style={{ backgroundImage: `url(${heroImage})` }}
              aria-hidden="true"
            />
          )}

          <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-0">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              {post.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.category)}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {post.category}
                  </Link>
                </>
              )}
            </nav>

            {/* Category badge */}
            {post.category && (
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {post.category}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance leading-tight mb-6 max-w-3xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-6 text-pretty">
                {post.excerpt}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              {post.author && (
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{post.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publication_date || post.createdAt}>{publishDate}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{post.readTime || post.read_time || "5"} min read</span>
              </div>
            </div>
          </div>

          {/* Hero image — full width, sits at bottom of hero */}
          {heroImage && (
            <div className="relative max-w-5xl mx-auto px-4">
              <div className="w-full aspect-[16/7] overflow-hidden rounded-t-2xl shadow-2xl">
                <img
                  src={heroImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </section>

        {/* ────────────────────────────────── CONTENT ── */}
        <section className="w-full py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10">

              {/* ── Main Article ── */}
              <article className="flex-1 min-w-0">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-border">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {post.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Blog HTML content */}
                <div
                  className="blog-content blog-article-content text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Author card */}
                {post.author && (
                  <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex items-start gap-4 p-6 rounded-xl bg-muted/40 border border-border">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Written by</p>
                        <p className="text-base font-semibold text-foreground">{post.author}</p>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          Expert content creator at CountryRoof, covering real estate, property trends, and market insights.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile share */}
                <div className="mt-8 lg:hidden">
                  <ShareButtons title={post.title} url={canonicalUrl} />
                </div>
              </article>

              {/* ── Sidebar ── */}
              <aside className="w-full lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-20 lg:self-start">
                {/* ToC */}
                <TableOfContents content={post.content} />

                {/* Share */}
                <div className="hidden lg:block">
                  <ShareButtons title={post.title} url={canonicalUrl} />
                </div>

                {/* Post meta card */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <p className="text-sm font-semibold">Post Details</p>
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Published</dt>
                        <dd className="font-medium text-foreground">{publishDate}</dd>
                      </div>
                    </div>
                    {post.category && (
                      <div className="flex items-start gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <dt className="text-xs text-muted-foreground">Category</dt>
                          <dd>
                            <Link
                              href={`/blog?category=${encodeURIComponent(post.category)}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {post.category}
                            </Link>
                          </dd>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <dt className="text-xs text-muted-foreground">Read time</dt>
                        <dd className="font-medium text-foreground">{post.readTime || post.read_time || "5"} minutes</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Tags cloud */}
                {post.tags && post.tags.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <p className="text-sm font-semibold mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>

        {/* ────────────────────────────── RELATED POSTS ── */}
        {relatedPosts.length > 0 && (
          <section className="w-full py-12 px-4 border-t border-border bg-muted/20">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Related Articles</h2>
                <Link
                  href="/blog"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((related) => {
                  const relatedImage = related.banner_image || related.cover_image
                  const relatedDate = new Date(
                    related.publication_date || related.createdAt || Date.now()
                  ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

                  return (
                    <Link
                      key={related._id}
                      href={`/blog/${related.slug}`}
                      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Thumbnail */}
                      <div className="w-full aspect-video bg-muted overflow-hidden">
                        {relatedImage ? (
                          <img
                            src={relatedImage}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <span className="text-3xl text-primary/30 font-bold">
                              {related.title?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-5">
                        {related.category && (
                          <span className="text-xs font-semibold text-primary mb-2">
                            {related.category}
                          </span>
                        )}
                        <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                            {related.excerpt}
                          </p>
                        )}
                        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
                          <span>{relatedDate}</span>
                          <span>&middot;</span>
                          <span>{related.readTime || related.read_time || "5"} min</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ────────────────────────────── BACK LINK ── */}
        <div className="w-full py-8 px-4 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all articles
            </Link>
          </div>
        </div>
      </main>

      <BackToTop />
      <Footer />
    </>
  )
}
