"use client"

import { useState } from "react"
import {
  Plus, Trash2, X, ChevronUp, ChevronDown,
  Link as LinkIcon, FileText, Code, Loader2,
} from "lucide-react"
import { Page } from "./Cms"
import { useMenus } from "@/src/hooks/useMenus"

interface MenusSectionProps {
  pages: Page[]
}

export function MenusSection({ pages }: MenusSectionProps) {

  const {
    menus, loading, error,
    createMenu, updateMenu, deleteMenu,
    addMenuItem, deleteMenuItem, reorderMenuItems,
  } = useMenus()

  // ── UI state ───────────────────────────────────────────
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null)
  const [addingItem, setAddingItem] = useState(false)
  const [newItemType, setNewItemType] = useState<"page" | "custom">("page")
  const [newItemLabel, setNewItemLabel] = useState("")
  const [newItemPageSlug, setNewItemPageSlug] = useState("")
  const [newItemUrl, setNewItemUrl] = useState("")
  const [editingMenuName, setEditingMenuName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // ── Create menu form state ─────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newMenuName, setNewMenuName] = useState("")
  const [newMenuLocation, setNewMenuLocation] = useState<"header" | "footer">("header")

  // ── Derived ────────────────────────────────────────────
  const selectedMenu = menus.find((m) => m.id === selectedMenuId) ?? menus[0] ?? null

  // ── Handlers ───────────────────────────────────────────

  // called when user submits the create form
  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) {
      setActionError("Menu name is required")
      return
    }
    try {
      setSaving(true)
      setActionError(null)
      const menu = await createMenu({
        name: newMenuName.trim(),
        location: newMenuLocation,  // ← always "header" or "footer", never "none"
      })
      setSelectedMenuId(menu.id)
      setShowCreateForm(false)
      setNewMenuName("")
      setNewMenuLocation("header")
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateMenu = async (updates: object) => {
    if (!selectedMenu) return
    try {
      setSaving(true)
      setActionError(null)
      await updateMenu(selectedMenu.id, updates)
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMenu = async (id: number) => {
    try {
      await deleteMenu(id)
      setSelectedMenuId(null)
    } catch (err: any) {
      setActionError(err.message)
    }
  }

  const handleAddItem = async () => {
    if (!selectedMenu) return
    try {
      setSaving(true)
      setActionError(null)
      await addMenuItem(selectedMenu.id, {
        label: newItemLabel ||
          (newItemType === "page"
            ? pages.find((p) => p.slug === newItemPageSlug)?.title || "Item"
            : "Link"),
        type: newItemType,
        slug: newItemType === "page" ? newItemPageSlug : null,
        url: newItemType === "custom" ? newItemUrl : null,
      })
      setAddingItem(false)
      setNewItemLabel("")
      setNewItemPageSlug("")
      setNewItemUrl("")
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    if (!selectedMenu) return
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= selectedMenu.items.length) return
    const newItems = [...selectedMenu.items]
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    try {
      await reorderMenuItems(selectedMenu.id, newItems.map((item, i) => ({ id: item.id, order: i })))
    } catch (err: any) {
      setActionError(err.message)
    }
  }

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedMenu) return
    try {
      await deleteMenuItem(selectedMenu.id, itemId)
    } catch (err: any) {
      setActionError(err.message)
    }
  }

  const generateNextJsCode = () => {
    if (!selectedMenu) return ""
    const itemsCode = selectedMenu.items
      .map((item) => {
        const href = item.type === "page" ? `/${item.slug || ""}` : item.url
        return `    { label: "${item.label}", href: "${href}" },`
      })
      .join("\n")
    const varName = selectedMenu.name.replace(/\s+/g, "")
    return `// layout.tsx - ${selectedMenu.location === "header" ? "Header" : "Footer"} Navigation
const ${varName}Items = [
${itemsCode}
];

<nav className="${selectedMenu.location === "header" ? "header-nav" : "footer-nav"}">
  {${varName}Items.map((item) => (
    <Link key={item.href} href={item.href}>
      {item.label}
    </Link>
  ))}
</nav>`
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 size={20} className="animate-spin mr-2" />
        Loading menus...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        {error}
      </div>
    )
  }

  return (
    <>
      {/* Error banner */}
      {actionError && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border border-destructive/20 flex items-center justify-between">
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-2">
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex h-full">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <div className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans font-bold text-foreground">Menus</h2>
              <button
                onClick={() => setShowCreateForm(true)}  // ← open form, not call API
                className="p-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <p className="text-xs font-mono text-muted-foreground">app/admin/menus/page.tsx</p>
          </div>

          {/* ── Inline Create Form ──────────────────────────── */}
          {showCreateForm && (
            <div className="p-3 border-b border-border bg-muted/20">

              {/* Name input */}
              <input
                type="text"
                placeholder="Menu name"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateMenu()}
                className="w-full p-2 mb-2 text-sm bg-input text-foreground border border-border outline-none focus:border-primary"
                autoFocus
              />

              {/* Location picker */}
              <div className="flex gap-1 mb-3">
                {(["header", "footer"] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setNewMenuLocation(loc)}
                    className={`flex-1 py-1.5 text-xs font-medium transition-all ${
                      newMenuLocation === loc
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {loc === "header" ? "Header" : "Footer"}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateMenu}
                  disabled={saving}
                  className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {saving && <Loader2 size={10} className="animate-spin" />}
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewMenuName("")
                    setNewMenuLocation("header")
                  }}
                  className="flex-1 py-1.5 bg-muted text-muted-foreground text-xs hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Menu list */}
          <div className="p-2 flex-1 overflow-auto">
            {menus.length === 0 && !showCreateForm ? (
              <p className="p-3 text-xs text-muted-foreground text-center">
                No menus yet. Click + to create one.
              </p>
            ) : (
              menus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedMenuId(menu.id)}
                  className={`w-full text-left px-3 py-2 mb-1 transition-all ${
                    selectedMenu?.id === menu.id
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="text-sm font-medium">{menu.name}</span>
                  <span className="block text-xs font-mono text-muted-foreground/60">
                    {menu.location}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Main: Menu Editor ──────────────────────────────── */}
        {selectedMenu ? (
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-3xl">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                {editingMenuName ? (
                  <input
                    type="text"
                    value={selectedMenu.name}
                    onChange={(e) => handleUpdateMenu({ name: e.target.value })}
                    onBlur={() => setEditingMenuName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingMenuName(false)}
                    className="bg-transparent text-2xl font-bold text-foreground border-b border-primary outline-none"
                    autoFocus
                  />
                ) : (
                  <h1
                    onClick={() => setEditingMenuName(true)}
                    className="font-sans text-2xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    {selectedMenu.name}
                  </h1>
                )}
                <button
                  onClick={() => handleDeleteMenu(selectedMenu.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Assign to Location
                </label>
                <div className="flex gap-2">
                  {(["header", "footer"] as const).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleUpdateMenu({ location: loc })}
                      className={`px-4 py-2 text-sm font-medium transition-all ${
                        selectedMenu.location === loc
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {loc === "header" ? "Header Nav" : "Footer Nav"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-muted-foreground">Menu Items</label>
                  <button
                    onClick={() => setAddingItem(true)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="bg-card border border-border">
                  {selectedMenu.items.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No items yet. Add your first menu item.
                    </p>
                  ) : (
                    selectedMenu.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveItem(index, "up")}
                            disabled={index === 0}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveItem(index, "down")}
                            disabled={index === selectedMenu.items.length - 1}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{item.label}</span>
                          <span className="ml-2 text-xs font-mono text-muted-foreground">
                            {item.type === "page" ? `/${item.slug || ""}` : item.url}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground">
                          {item.type}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Item Form */}
              {addingItem && (
                <div className="mb-6 p-4 bg-card border border-border">
                  <h3 className="font-medium text-foreground mb-4">Add Menu Item</h3>
                  <div className="flex gap-2 mb-4">
                    {(["page", "custom"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewItemType(type)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-all ${
                          newItemType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {type === "page" ? <FileText size={14} /> : <LinkIcon size={14} />}
                        {type === "page" ? "Page" : "Custom Link"}
                      </button>
                    ))}
                  </div>

                  {newItemType === "page" ? (
                    <select
                      value={newItemPageSlug}
                      onChange={(e) => setNewItemPageSlug(e.target.value)}
                      className="w-full p-2 mb-3 bg-input text-foreground border border-border outline-none focus:border-primary"
                    >
                      <option value="">Select a page...</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.slug}>
                          {page.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Label"
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        className="w-full p-2 mb-3 bg-input text-foreground border border-border outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="URL (e.g., /page or https://...)"
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                        className="w-full p-2 mb-3 bg-input text-foreground border border-border outline-none focus:border-primary"
                      />
                    </>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddItem}
                      disabled={saving}
                      className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 size={12} className="animate-spin" />}
                      Add
                    </button>
                    <button
                      onClick={() => setAddingItem(false)}
                      className="px-4 py-1.5 bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Code Preview */}
              {selectedMenu.location !== "none" && selectedMenu.items.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code size={16} className="text-primary" />
                    <label className="text-sm font-medium text-muted-foreground">
                      Next.js Component Preview
                    </label>
                  </div>
                  <pre className="p-4 bg-code-bg border border-border overflow-x-auto">
                    <code className="font-mono text-sm text-foreground">
                      {generateNextJsCode()}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select or create a menu
          </div>
        )}
      </div>
    </>
  )
}