"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { EditorCanvas } from "@/components/blog/block-editor"
import { 
  Save, 
  Eye, 
  Send, 
  Settings2, 
  Search, 
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  FileText,
  Globe,
  Clock,
  X,
  Plus,
  Check,
  Loader2,
  PanelRightClose,
  PanelRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  RectangleHorizontal,
  Palette,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus
} from "lucide-react"

interface BlogCategory {
  _id: string
  name: string
  slug: string
}

interface WordPressBlogEditorProps {
  initialData?: {
    _id?: string
    title?: string
    excerpt?: string
    content?: string
    category?: string | string[]
    author?: string
    readTime?: string
    cover_image?: string
    banner_image?: string
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    og_title?: string
    og_description?: string
    og_image?: string
    tags?: string[] | string
    is_published?: boolean
    slug?: string
  }
}

// Collapsible Panel Component
function CollapsiblePanel({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

// SEO Score Component
function SEOScore({ score, label }: { score: number; label: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "bg-green-500"
    if (s >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getScoreColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-12">{label}</span>
    </div>
  )
}

// Google Preview Component
function GooglePreview({ 
  title, 
  slug, 
  description,
  siteUrl = "countryroof.com"
}: { 
  title: string
  slug: string
  description: string
  siteUrl?: string
}) {
  const displayUrl = `${siteUrl}/blog/${slug || "post-url"}`
  const displayTitle = title || "Post title"
  const displayDesc = description || "Add a meta description to see how this post will appear in search results..."
  
  return (
    <div className="p-3 bg-background rounded-lg border border-border">
      <p className="text-xs text-muted-foreground mb-1">Google Preview</p>
      <div className="space-y-1">
        <p className="text-xs text-green-700 dark:text-green-400 truncate">{displayUrl}</p>
        <p className="text-base text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
          {displayTitle}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">{displayDesc}</p>
      </div>
    </div>
  )
}

// Block Settings Panel Component
function BlockSettingsPanel({ 
  blockType, 
  onClose 
}: { 
  blockType: string | null
  onClose: () => void 
}) {
  if (!blockType) return null
  
  const getBlockIcon = () => {
    switch (blockType) {
      case "heading": return Heading1
      case "paragraph": return Type
      case "bulletList": return List
      case "orderedList": return ListOrdered
      case "blockquote": return Quote
      case "codeBlock": return Code
      case "image": return ImageIcon
      case "horizontalRule": return Minus
      default: return Layers
    }
  }
  
  const BlockIcon = getBlockIcon()
  const blockLabel = blockType.charAt(0).toUpperCase() + blockType.slice(1).replace(/([A-Z])/g, " $1")
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BlockIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{blockLabel}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-muted rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Select a block in the editor to see its settings here.
      </div>
      
      {/* Typography Settings - for text blocks */}
      {["paragraph", "heading", "text"].includes(blockType) && (
        <CollapsiblePanel title="Typography" icon={Type} defaultOpen>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Font Size</label>
              <select className="w-full h-8 text-sm border border-border rounded px-2 bg-background">
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Text Alignment</label>
              <div className="flex gap-1">
                <button type="button" className="flex-1 p-2 border border-border rounded hover:bg-muted">
                  <AlignLeft className="h-4 w-4 mx-auto" />
                </button>
                <button type="button" className="flex-1 p-2 border border-border rounded hover:bg-muted">
                  <AlignCenter className="h-4 w-4 mx-auto" />
                </button>
                <button type="button" className="flex-1 p-2 border border-border rounded hover:bg-muted">
                  <AlignRight className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </CollapsiblePanel>
      )}
      
      {/* Image Settings */}
      {blockType === "image" && (
        <>
          <CollapsiblePanel title="Image Size" icon={Maximize2} defaultOpen>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Width</label>
                <select className="w-full h-8 text-sm border border-border rounded px-2 bg-background">
                  <option value="25%">Small (25%)</option>
                  <option value="50%">Medium (50%)</option>
                  <option value="75%">Large (75%)</option>
                  <option value="100%">Full Width (100%)</option>
                  <option value="auto">Original Size</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Alignment</label>
                <div className="flex gap-1">
                  <button type="button" className="flex-1 p-2 border border-border rounded hover:bg-muted">
                    <AlignLeft className="h-4 w-4 mx-auto" />
                  </button>
                  <button type="button" className="flex-1 p-2 border border-border rounded hover:bg-muted">
                    <AlignCenter className="h-4 w-4 mx-auto" />
                  </button>
                  <button type="button" className="flex-1 p-2 border border-border rounded hover:bg-muted">
                    <AlignRight className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </CollapsiblePanel>
          
          <CollapsiblePanel title="Alt Text & Caption" icon={FileText} defaultOpen>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Alt Text</label>
                <Input placeholder="Describe the image..." className="h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Caption</label>
                <Input placeholder="Image caption..." className="h-8 text-sm" />
              </div>
            </div>
          </CollapsiblePanel>
          
          <CollapsiblePanel title="Link" icon={Globe}>
            <div className="space-y-2">
              <Input placeholder="https://..." className="h-8 text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Open in new tab
              </label>
            </div>
          </CollapsiblePanel>
        </>
      )}
      
      {/* Color Settings - for applicable blocks */}
      {["paragraph", "heading", "blockquote"].includes(blockType) && (
        <CollapsiblePanel title="Color" icon={Palette}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Text Color</label>
              <div className="flex gap-1 flex-wrap">
                {["#000000", "#374151", "#DC2626", "#2563EB", "#059669", "#D97706", "#7C3AED"].map(color => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Background Color</label>
              <div className="flex gap-1 flex-wrap">
                {["transparent", "#F3F4F6", "#FEE2E2", "#DBEAFE", "#D1FAE5", "#FEF3C7", "#EDE9FE"].map(color => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-border"
                    style={{ backgroundColor: color === "transparent" ? "white" : color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CollapsiblePanel>
      )}
      
      {/* Spacing Settings */}
      <CollapsiblePanel title="Spacing" icon={RectangleHorizontal}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Margin Top</label>
            <Input type="number" placeholder="0" className="h-8 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Margin Bottom</label>
            <Input type="number" placeholder="0" className="h-8 text-sm" />
          </div>
        </div>
      </CollapsiblePanel>
    </div>
  )
}

export default function WordPressBlogEditor({ initialData }: WordPressBlogEditorProps) {
  const router = useRouter()
  const isEditing = !!initialData?._id
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePanel, setActivePanel] = useState<"post" | "seo" | "block">("post")
  const [selectedBlockType, setSelectedBlockType] = useState<string | null>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaving, setAutoSaving] = useState(false)
  
  // Parse initial categories
  const getInitialCategories = () => {
    if (!initialData?.category) return []
    if (Array.isArray(initialData.category)) return initialData.category
    return [initialData.category]
  }
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    categories: getInitialCategories(),
    author: initialData?.author || "",
    readTime: initialData?.readTime || "5",
    cover_image: initialData?.cover_image || "",
    banner_image: initialData?.banner_image || "",
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
    meta_keywords: initialData?.meta_keywords || "",
    og_title: initialData?.og_title || "",
    og_description: initialData?.og_description || "",
    og_image: initialData?.og_image || "",
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : initialData?.tags || "",
    is_published: initialData?.is_published || false,
    slug: initialData?.slug || "",
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<BlogCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }, [])

  // Calculate SEO score
  const calculateSEOScore = useCallback(() => {
    let score = 0
    const checks = {
      hasTitle: formData.meta_title.length > 0,
      titleLength: formData.meta_title.length >= 30 && formData.meta_title.length <= 60,
      hasDescription: formData.meta_description.length > 0,
      descriptionLength: formData.meta_description.length >= 120 && formData.meta_description.length <= 160,
      hasKeywords: formData.meta_keywords.length > 0,
      hasContent: formData.content.length > 500,
      hasExcerpt: formData.excerpt.length > 0,
      hasFeaturedImage: !!formData.cover_image || !!formData.banner_image,
    }
    
    if (checks.hasTitle) score += 15
    if (checks.titleLength) score += 10
    if (checks.hasDescription) score += 15
    if (checks.descriptionLength) score += 10
    if (checks.hasKeywords) score += 10
    if (checks.hasContent) score += 20
    if (checks.hasExcerpt) score += 10
    if (checks.hasFeaturedImage) score += 10
    
    return { score, checks }
  }, [formData])

  const seoData = calculateSEOScore()

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/blog/categories")
        if (response.ok) {
          const data = await response.json()
          setAvailableCategories(data.categories || [])
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Auto-save draft (every 60 seconds when content changes)
  useEffect(() => {
    if (!formData.title || formData.is_published) return
    
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    
    autoSaveRef.current = setTimeout(async () => {
      setAutoSaving(true)
      try {
        const url = isEditing ? `/api/admin/blog/posts/${initialData?._id}` : "/api/admin/blog/posts"
        const method = isEditing ? "PUT" : "POST"
        
        const payload = {
          ...formData,
          category: formData.categories,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          is_published: false,
        }
        
        const response = await fetch(url, { 
          method, 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        
        if (response.ok) {
          setLastSaved(new Date())
        }
      } catch (err) {
        console.error("Auto-save failed:", err)
      } finally {
        setAutoSaving(false)
      }
    }, 60000)
    
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [formData, isEditing, initialData?._id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      // Auto-generate slug from title if not manually set
      if (name === "title" && !prev.slug) {
        newData.slug = generateSlug(value)
      }
      // Auto-fill meta title if empty
      if (name === "title" && !prev.meta_title) {
        newData.meta_title = value
      }
      return newData
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading((prev) => ({ ...prev, [fieldName]: true }))
    setError("")

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("folder", "blog")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setFormData((prev) => ({ ...prev, [fieldName]: data.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }))
      e.target.value = ""
    }
  }

  const toggleCategory = (categoryName: string) => {
    setFormData((prev) => {
      const current = prev.categories
      if (current.includes(categoryName)) {
        return { ...prev, categories: current.filter((c) => c !== categoryName) }
      }
      return { ...prev, categories: [...current, categoryName] }
    })
  }

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    try {
      const response = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })
      if (response.ok) {
        const data = await response.json()
        setAvailableCategories((prev) => [...prev, data.category])
        setFormData((prev) => ({
          ...prev,
          categories: [...prev.categories, data.category.name],
        }))
        setNewCategoryName("")
      }
    } catch (err) {
      console.error("Failed to add category:", err)
    } finally {
      setAddingCategory(false)
    }
  }

  const handleSubmit = async (publishStatus: boolean = true) => {
    if (!formData.title.trim()) {
      setError("Please enter a title for your post")
      return
    }
    
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const url = isEditing ? `/api/admin/blog/posts/${initialData?._id}` : "/api/admin/blog/posts"
      const method = isEditing ? "PUT" : "POST"

      const payload = {
        ...formData,
        category: formData.categories,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: publishStatus,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} blog post`)
      }

      setSuccess(true)
      setFormData((prev) => ({ ...prev, is_published: publishStatus }))
      
      setTimeout(() => {
        router.refresh()
        router.push("/admin/blog")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    // Open preview in new tab
    const slug = formData.slug || generateSlug(formData.title)
    window.open(`/blog/${slug}?preview=true`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Toolbar - WordPress Style */}
      <header className="sticky top-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/blog")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">All Posts</span>
          </Button>
          
          <div className="h-6 w-px bg-border hidden sm:block" />
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {autoSaving && (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
            {lastSaved && !autoSaving && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Draft */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>

          {/* Preview */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={!formData.title}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          {/* Publish/Update */}
          <Button
            size="sm"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isEditing ? (formData.is_published ? "Update" : "Publish") : "Publish"}</span>
          </Button>

          <div className="h-6 w-px bg-border" />

          {/* Toggle Sidebar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="gap-2"
          >
            {sidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Status Messages */}
      {(error || success) && (
        <div className={cn(
          "px-4 py-2 text-sm flex items-center gap-2 justify-center",
          error ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
        )}>
          {error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {error || "Post saved successfully!"}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          sidebarOpen ? "mr-0" : "mr-0"
        )}>
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Add title"
                className="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0"
              />
              <p className="text-sm text-muted-foreground">
                Permalink: /blog/{formData.slug || generateSlug(formData.title) || "post-url"}
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Write a brief excerpt or summary of your post..."
                className="min-h-[80px] resize-none border-dashed"
              />
            </div>

            {/* Block Editor Canvas */}
            <div className="min-h-[500px] border border-border rounded-lg overflow-hidden bg-background">
              <EditorCanvas
                content={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                placeholder="Start writing or type '/' to insert a block..."
                onBlockSelect={(blockType) => {
                  setSelectedBlockType(blockType)
                  if (blockType) {
                    setActivePanel("block")
                  }
                }}
              />
            </div>
          </div>
        </main>

        {/* Right Sidebar - Sticky */}
        <aside className={cn(
          "w-80 border-l border-border bg-card transition-all duration-300 flex flex-col sticky top-0 h-screen overflow-hidden",
          sidebarOpen ? "translate-x-0" : "translate-x-full hidden"
        )}>
          {/* Sidebar Tabs */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setActivePanel("post")}
              className={cn(
                "flex-1 px-3 py-3 text-sm font-medium transition-colors",
                activePanel === "post" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Settings2 className="h-4 w-4" />
                <span className="hidden lg:inline">Post</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("block")}
              className={cn(
                "flex-1 px-3 py-3 text-sm font-medium transition-colors relative",
                activePanel === "block" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span className="hidden lg:inline">Block</span>
                {selectedBlockType && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("seo")}
              className={cn(
                "flex-1 px-3 py-3 text-sm font-medium transition-colors relative",
                activePanel === "seo" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Search className="h-4 w-4" />
                <span className="hidden lg:inline">SEO</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-medium",
                  seoData.score >= 80 ? "bg-green-500/20 text-green-600" :
                  seoData.score >= 50 ? "bg-yellow-500/20 text-yellow-600" :
                  "bg-red-500/20 text-red-600"
                )}>
                  {seoData.score}
                </span>
              </span>
            </button>
          </div>

          {/* Post Settings Panel */}
          {activePanel === "post" && (
            <div className="flex-1 overflow-y-auto pb-20">
              {/* Status */}
              <CollapsiblePanel title="Status" icon={FileText} defaultOpen>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visibility</span>
                  <span className="text-sm font-medium">
                    {formData.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </CollapsiblePanel>

              {/* Author */}
              <CollapsiblePanel title="Author" icon={User} defaultOpen>
                <Input
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Author name"
                />
              </CollapsiblePanel>

              {/* Categories */}
              <CollapsiblePanel title="Categories" icon={Tag} defaultOpen>
                <div className="space-y-2">
                  {/* Add new category */}
                  <div className="flex gap-2">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="New category..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addNewCategory()
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addNewCategory}
                      disabled={!newCategoryName.trim() || addingCategory}
                      className="h-8 px-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Selected categories */}
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className="hover:text-primary/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category list */}
                  <div className="max-h-32 overflow-y-auto border border-border rounded-md">
                    {loadingCategories ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Loading...
                      </div>
                    ) : availableCategories.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No categories yet
                      </div>
                    ) : (
                      <div className="p-1">
                        {availableCategories.map((cat) => (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => toggleCategory(cat.name)}
                            className="w-full px-2 py-1.5 text-left text-sm hover:bg-muted rounded flex items-center justify-between"
                          >
                            <span>{cat.name}</span>
                            {formData.categories.includes(cat.name) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CollapsiblePanel>

              {/* Tags */}
              <CollapsiblePanel title="Tags" icon={Tag}>
                <div className="space-y-2">
                  <Input
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="tag1, tag2, tag3"
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                </div>
              </CollapsiblePanel>

              {/* Featured Image */}
              <CollapsiblePanel title="Featured Image" icon={ImageIcon} defaultOpen>
                <div className="space-y-3">
                  {formData.cover_image ? (
                    <div className="relative">
                      <img
                        src={formData.cover_image}
                        alt="Featured"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => setFormData((prev) => ({ ...prev, cover_image: "" }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "cover_image")}
                        disabled={uploading.cover_image}
                        className="hidden"
                      />
                      {uploading.cover_image ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
                          <span className="text-xs text-muted-foreground">Click to upload</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </CollapsiblePanel>

              {/* Banner Image */}
              <CollapsiblePanel title="Banner Image" icon={ImageIcon}>
                <div className="space-y-3">
                  {formData.banner_image ? (
                    <div className="relative">
                      <img
                        src={formData.banner_image}
                        alt="Banner"
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => setFormData((prev) => ({ ...prev, banner_image: "" }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "banner_image")}
                        disabled={uploading.banner_image}
                        className="hidden"
                      />
                      {uploading.banner_image ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon className="h-5 w-5 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Upload banner</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </CollapsiblePanel>

              {/* Read Time */}
              <CollapsiblePanel title="Read Time" icon={Clock}>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleChange}
                    min="1"
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </CollapsiblePanel>

              {/* Slug */}
              <CollapsiblePanel title="URL Slug" icon={Globe}>
                <div className="space-y-2">
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="post-url-slug"
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to auto-generate from title
                  </p>
                </div>
              </CollapsiblePanel>
            </div>
          )}

          {/* Block Settings Panel */}
          {activePanel === "block" && (
            <div className="flex-1 overflow-y-auto pb-20">
              {selectedBlockType ? (
                <BlockSettingsPanel 
                  blockType={selectedBlockType} 
                  onClose={() => {
                    setSelectedBlockType(null)
                    setActivePanel("post")
                  }} 
                />
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium mb-1">No block selected</p>
                  <p className="text-xs">Click on a block in the editor to see its settings here.</p>
                </div>
              )}
            </div>
          )}

          {/* SEO Panel */}
          {activePanel === "seo" && (
            <div className="flex-1 overflow-y-auto pb-20">
              {/* SEO Score */}
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SEO Score</span>
                  <span className={cn(
                    "text-lg font-bold",
                    seoData.score >= 80 ? "text-green-600" :
                    seoData.score >= 50 ? "text-yellow-600" :
                    "text-red-600"
                  )}>
                    {seoData.score}/100
                  </span>
                </div>
                <SEOScore score={seoData.score} label={
                  seoData.score >= 80 ? "Good" :
                  seoData.score >= 50 ? "OK" : "Needs Work"
                } />
              </div>

              {/* Google Preview */}
              <div className="p-4 border-b border-border">
                <GooglePreview
                  title={formData.meta_title || formData.title}
                  slug={formData.slug || generateSlug(formData.title)}
                  description={formData.meta_description || formData.excerpt}
                />
              </div>

              {/* SEO Fields */}
              <CollapsiblePanel title="SEO Title" icon={FileText} defaultOpen>
                <div className="space-y-2">
                  <Input
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    placeholder="SEO title (50-60 characters)"
                    className="h-8 text-sm"
                  />
                  <div className="flex justify-between text-xs">
                    <span className={cn(
                      formData.meta_title.length >= 30 && formData.meta_title.length <= 60
                        ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {formData.meta_title.length} characters
                    </span>
                    <span className="text-muted-foreground">Recommended: 50-60</span>
                  </div>
                </div>
              </CollapsiblePanel>

              <CollapsiblePanel title="Meta Description" icon={FileText} defaultOpen>
                <div className="space-y-2">
                  <Textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    placeholder="Meta description (120-160 characters)"
                    className="min-h-[80px] text-sm resize-none"
                  />
                  <div className="flex justify-between text-xs">
                    <span className={cn(
                      formData.meta_description.length >= 120 && formData.meta_description.length <= 160
                        ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {formData.meta_description.length} characters
                    </span>
                    <span className="text-muted-foreground">Recommended: 120-160</span>
                  </div>
                </div>
              </CollapsiblePanel>

              <CollapsiblePanel title="Focus Keywords" icon={Search}>
                <div className="space-y-2">
                  <Input
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleChange}
                    placeholder="keyword1, keyword2, keyword3"
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
                </div>
              </CollapsiblePanel>

              {/* Open Graph */}
              <CollapsiblePanel title="Social Sharing" icon={Globe}>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">OG Title</label>
                    <Input
                      name="og_title"
                      value={formData.og_title}
                      onChange={handleChange}
                      placeholder="Social media title"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">OG Description</label>
                    <Textarea
                      name="og_description"
                      value={formData.og_description}
                      onChange={handleChange}
                      placeholder="Social media description"
                      className="min-h-[60px] text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">OG Image URL</label>
                    <Input
                      name="og_image"
                      value={formData.og_image}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </CollapsiblePanel>

              {/* SEO Checklist */}
              <CollapsiblePanel title="SEO Checklist" icon={Sparkles} defaultOpen>
                <div className="space-y-2">
                  {[
                    { check: seoData.checks.hasTitle, label: "Has SEO title" },
                    { check: seoData.checks.titleLength, label: "Title length is optimal" },
                    { check: seoData.checks.hasDescription, label: "Has meta description" },
                    { check: seoData.checks.descriptionLength, label: "Description length is optimal" },
                    { check: seoData.checks.hasKeywords, label: "Has focus keywords" },
                    { check: seoData.checks.hasContent, label: "Content is long enough" },
                    { check: seoData.checks.hasExcerpt, label: "Has excerpt" },
                    { check: seoData.checks.hasFeaturedImage, label: "Has featured image" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {item.check ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={item.check ? "text-foreground" : "text-muted-foreground"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsiblePanel>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
