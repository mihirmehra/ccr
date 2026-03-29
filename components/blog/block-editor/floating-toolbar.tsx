"use client"

import type { Editor } from "@tiptap/core"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Code,
  ChevronDown,
  Type,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Minus,
  Maximize2,
  Minimize2,
  ImageIcon,
  RectangleHorizontal,
  Pilcrow,
  TableIcon,
  Plus,
  X,
  RowsIcon,
  ColumnsIcon,
  SeparatorHorizontal,
  Highlighter
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface FloatingToolbarProps {
  editor: Editor
  position: { top: number; left: number }
  blockType: string
}

export function FloatingToolbar({ editor, position, blockType }: FloatingToolbarProps) {
  const [showTransformMenu, setShowTransformMenu] = useState(false)
  const [showSizeMenu, setShowSizeMenu] = useState(false)
  const [showTableMenu, setShowTableMenu] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowTransformMenu(false)
        setShowSizeMenu(false)
        setShowTableMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const transformOptions = [
    { type: "paragraph", label: "Paragraph", icon: Pilcrow },
    { type: "heading1", label: "Heading 1", icon: Heading1 },
    { type: "heading2", label: "Heading 2", icon: Heading2 },
    { type: "heading3", label: "Heading 3", icon: Heading3 },
    { type: "heading4", label: "Heading 4", icon: Heading4 },
    { type: "heading5", label: "Heading 5", icon: Heading5 },
    { type: "heading6", label: "Heading 6", icon: Heading6 },
    { divider: true, type: "div1", label: "", icon: Minus },
    { type: "bulletList", label: "Bullet List", icon: List },
    { type: "orderedList", label: "Numbered List", icon: ListOrdered },
    { type: "blockquote", label: "Quote", icon: Quote },
    { type: "codeBlock", label: "Code Block", icon: Code },
    { type: "horizontalRule", label: "Horizontal Rule", icon: SeparatorHorizontal }
  ]

  const imageSizeOptions = [
    { size: "small", label: "Small (25%)", width: "25%" },
    { size: "medium", label: "Medium (50%)", width: "50%" },
    { size: "large", label: "Large (75%)", width: "75%" },
    { size: "full", label: "Full Width", width: "100%" },
    { size: "original", label: "Original Size", width: "auto" }
  ]

  const handleTransform = (type: string) => {
    switch (type) {
      case "paragraph": editor.chain().focus().setParagraph().run(); break
      case "heading1": editor.chain().focus().toggleHeading({ level: 1 }).run(); break
      case "heading2": editor.chain().focus().toggleHeading({ level: 2 }).run(); break
      case "heading3": editor.chain().focus().toggleHeading({ level: 3 }).run(); break
      case "heading4": editor.chain().focus().toggleHeading({ level: 4 }).run(); break
      case "heading5": editor.chain().focus().toggleHeading({ level: 5 }).run(); break
      case "heading6": editor.chain().focus().toggleHeading({ level: 6 }).run(); break
      case "bulletList": editor.chain().focus().toggleBulletList().run(); break
      case "orderedList": editor.chain().focus().toggleOrderedList().run(); break
      case "blockquote": editor.chain().focus().toggleBlockquote().run(); break
      case "codeBlock": editor.chain().focus().toggleCodeBlock().run(); break
      case "horizontalRule": editor.chain().focus().setHorizontalRule().run(); break
    }
    setShowTransformMenu(false)
  }

  const handleImageSize = (width: string) => {
    editor.chain().focus().updateAttributes("image", {
      style: width === "auto" ? "" : `width: ${width}; max-width: 100%;`
    }).run()
    setShowSizeMenu(false)
  }

  const getCurrentBlockLabel = () => {
    if (editor.isActive("heading", { level: 1 })) return "Heading 1"
    if (editor.isActive("heading", { level: 2 })) return "Heading 2"
    if (editor.isActive("heading", { level: 3 })) return "Heading 3"
    if (editor.isActive("heading", { level: 4 })) return "Heading 4"
    if (editor.isActive("heading", { level: 5 })) return "Heading 5"
    if (editor.isActive("heading", { level: 6 })) return "Heading 6"
    if (editor.isActive("bulletList")) return "Bullet List"
    if (editor.isActive("orderedList")) return "Numbered List"
    if (editor.isActive("blockquote")) return "Quote"
    if (editor.isActive("codeBlock")) return "Code Block"
    if (editor.isActive("table")) return "Table"
    return "Paragraph"
  }

  // Computed position: clamp to not go off-screen left, and sit above the block
  const toolbarStyle: React.CSSProperties = {
    position: "absolute",
    top: Math.max(0, position.top - 52),
    left: Math.max(0, position.left),
    zIndex: 50
  }

  // ----------------------------------------------------------------
  // TABLE toolbar
  // ----------------------------------------------------------------
  if (editor.isActive("table") || blockType === "table" || blockType === "tableCell" || blockType === "tableHeader" || blockType === "tableRow") {
    return (
      <div
        ref={toolbarRef}
        className="absolute z-50 bg-card border border-border rounded-lg shadow-xl flex items-center flex-wrap"
        style={toolbarStyle}
      >
        {/* Block label */}
        <div className="flex items-center border-r border-border">
          <button
            type="button"
            onClick={() => setShowTransformMenu(!showTransformMenu)}
            className="flex items-center gap-1 px-3 py-2 hover:bg-muted text-sm font-medium whitespace-nowrap"
          >
            <TableIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {showTransformMenu && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl py-1 w-52 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">Transform to</div>
              {transformOptions.map((option, idx) => (
                <div key={`${option.type}-${idx}`}>
                  {option.divider && <div className="my-1 border-t border-border" />}
                  {!option.divider && (
                    <button
                      type="button"
                      onClick={() => handleTransform(option.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm text-left"
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table operations */}
        <div className="flex items-center px-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="p-2 rounded hover:bg-muted"
            title="Add column before"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="p-2 rounded hover:bg-muted"
            title="Delete column"
          >
            <ColumnsIcon className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="p-2 rounded hover:bg-muted"
            title="Add row before"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="p-2 rounded hover:bg-muted"
            title="Delete row"
          >
            <RowsIcon className="h-3.5 w-3.5" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().mergeCells().run()}
            className="p-2 rounded hover:bg-muted text-xs font-medium"
            title="Merge cells"
          >
            <RectangleHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().splitCell().run()}
            className="p-2 rounded hover:bg-muted"
            title="Split cell"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Delete table */}
        <div className="flex items-center border-l border-border px-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="p-2 rounded hover:bg-muted text-destructive"
            title="Delete table"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // IMAGE toolbar
  // ----------------------------------------------------------------
  if (blockType === "image") {
    return (
      <div
        ref={toolbarRef}
        className="absolute z-50 bg-card border border-border rounded-lg shadow-xl flex items-center p-1"
        style={toolbarStyle}
      >
        {/* Size */}
        <div className="relative border-r border-border pr-1 mr-1">
          <button
            type="button"
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-muted text-sm font-medium rounded"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="hidden sm:inline">Size</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl py-1 w-48 z-50">
              <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">Image Size</div>
              {imageSizeOptions.map((option) => (
                <button
                  key={option.size}
                  type="button"
                  onClick={() => handleImageSize(option.width)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm text-left"
                >
                  {option.size === "small" && <Minimize2 className="h-4 w-4" />}
                  {option.size === "medium" && <ImageIcon className="h-4 w-4" />}
                  {(option.size === "large" || option.size === "original") && <Maximize2 className="h-4 w-4" />}
                  {option.size === "full" && <RectangleHorizontal className="h-4 w-4" />}
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alignment */}
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className="p-2 rounded hover:bg-muted" title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className="p-2 rounded hover:bg-muted" title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className="p-2 rounded hover:bg-muted" title="Align Right">
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Replace */}
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = "image/*"
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (!file) return
              const fd = new FormData()
              fd.append("file", file)
              fd.append("folder", "blog")
              try {
                const res = await fetch("/api/upload", { method: "POST", body: fd })
                if (res.ok) {
                  const data = await res.json()
                  editor.chain().focus().setImage({ src: data.url }).run()
                }
              } catch (err) {
                console.error("Failed to upload image:", err)
              }
            }
            input.click()
          }}
          className="p-2 rounded hover:bg-muted flex items-center gap-1"
          title="Replace Image"
        >
          <ImageIcon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Replace</span>
        </button>

        {/* Caption */}
        <button
          type="button"
          onClick={() => {
            const caption = window.prompt("Enter image caption:")
            if (caption) editor.chain().focus().updateAttributes("image", { alt: caption, title: caption }).run()
          }}
          className="p-2 rounded hover:bg-muted"
          title="Edit Caption / Alt Text"
        >
          <Type className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().deleteSelection().run()}
          className="p-2 rounded hover:bg-muted text-destructive"
          title="Delete Image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // TEXT / HEADING / LIST / BLOCKQUOTE / CODE toolbar (default)
  // ----------------------------------------------------------------
  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 bg-card border border-border rounded-lg shadow-xl flex items-center flex-wrap"
      style={toolbarStyle}
    >
      {/* Block Type Selector */}
      <div className="relative border-r border-border">
        <button
          type="button"
          onClick={() => setShowTransformMenu(!showTransformMenu)}
          className="flex items-center gap-1 px-3 py-2 hover:bg-muted text-sm font-medium whitespace-nowrap"
        >
          <Type className="h-4 w-4" />
          <span className="hidden sm:inline">{getCurrentBlockLabel()}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showTransformMenu && (
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl py-1 w-52 z-50 max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">Transform to</div>
            {transformOptions.map((option, idx) => (
              <div key={`${option.type}-${idx}`}>
                {option.divider && <div className="my-1 border-t border-border" />}
                {!option.divider && (
                  <button
                    type="button"
                    onClick={() => handleTransform(option.type)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm text-left",
                      getCurrentBlockLabel() === option.label && "bg-muted"
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Text Formatting */}
      <div className="flex items-center px-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("bold") && "bg-primary/10 text-primary")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("italic") && "bg-primary/10 text-primary")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("underline") && "bg-primary/10 text-primary")}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("strike") && "bg-primary/10 text-primary")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href
            const url = window.prompt("Enter link URL:", previousUrl || "https://")
            if (url === null) return
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
              return
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
          }}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("link") && "bg-primary/10 text-primary")}
          title="Link (Ctrl+K)"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("highlight") && "bg-primary/10 text-primary")}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive({ textAlign: "left" }) && "bg-primary/10 text-primary")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive({ textAlign: "center" }) && "bg-primary/10 text-primary")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive({ textAlign: "right" }) && "bg-primary/10 text-primary")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive({ textAlign: "justify" }) && "bg-primary/10 text-primary")}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Quick heading shortcuts */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("heading", { level: 2 }) && "bg-primary/10 text-primary")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("heading", { level: 3 }) && "bg-primary/10 text-primary")}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("bulletList") && "bg-primary/10 text-primary")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("orderedList") && "bg-primary/10 text-primary")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("blockquote") && "bg-primary/10 text-primary")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn("p-2 rounded hover:bg-muted", editor.isActive("codeBlock") && "bg-primary/10 text-primary")}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Divider insert */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-muted"
          title="Insert Divider"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Block Actions */}
      <div className="flex items-center border-l border-border px-1">
        <button
          type="button"
          onClick={() => {
            const { state } = editor
            const { selection } = state
            const text = state.doc.textBetween(selection.from, selection.to)
            if (text) navigator.clipboard.writeText(text)
          }}
          className="p-2 rounded hover:bg-muted"
          title="Copy selection"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-muted"
          title="Clear formatting"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().deleteSelection().run()}
          className="p-2 rounded hover:bg-muted text-destructive"
          title="Delete selection"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
