"use client"

import { useState } from "react"
import {
  Plus,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  FileText,
  Code,
} from "lucide-react"
// import { MenuData, MenuItem, Page } from "@/types/cms"
import { MenuData, MenuItem, Page } from "./Cms"

interface MenusSectionProps {
  menus: MenuData[]
  setMenus: (menus: MenuData[]) => void
  pages: Page[]
}

export function MenusSection({ menus, setMenus, pages }: MenusSectionProps) {
  const [selectedMenu, setSelectedMenu] = useState<MenuData | null>(menus[0] || null)
  const [addingItem, setAddingItem] = useState(false)
  const [newItemType, setNewItemType] = useState<"page" | "custom">("page")
  const [newItemLabel, setNewItemLabel] = useState("")
  const [newItemPageId, setNewItemPageId] = useState("")
  const [newItemUrl, setNewItemUrl] = useState("")
  const [editingMenuName, setEditingMenuName] = useState(false)

  const createMenu = () => {
    const newMenu: MenuData = {
      id: Date.now().toString(),
      name: "New Menu",
      location: "none",
      items: [],
    }
    setMenus([...menus, newMenu])
    setSelectedMenu(newMenu)
  }

  const updateMenu = (updatedMenu: MenuData) => {
    setMenus(menus.map((m) => (m.id === updatedMenu.id ? updatedMenu : m)))
    setSelectedMenu(updatedMenu)
  }

  const deleteMenu = (id: string) => {
    const remaining = menus.filter((m) => m.id !== id)
    setMenus(remaining)
    setSelectedMenu(remaining[0] || null)
  }

  const addMenuItem = () => {
    if (!selectedMenu) return
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label:
        newItemLabel ||
        (newItemType === "page"
          ? pages.find((p) => p.id === newItemPageId)?.title || "Item"
          : "Link"),
      type: newItemType,
      pageId: newItemType === "page" ? newItemPageId : undefined,
      url: newItemType === "custom" ? newItemUrl : undefined,
      children: [],
    }
    updateMenu({ ...selectedMenu, items: [...selectedMenu.items, newItem] })
    setAddingItem(false)
    setNewItemLabel("")
    setNewItemPageId("")
    setNewItemUrl("")
  }

  const moveItem = (index: number, direction: "up" | "down") => {
    if (!selectedMenu) return
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= selectedMenu.items.length) return
    const newItems = [...selectedMenu.items]
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    updateMenu({ ...selectedMenu, items: newItems })
  }

  const removeItem = (id: string) => {
    if (!selectedMenu) return
    updateMenu({ ...selectedMenu, items: selectedMenu.items.filter((item) => item.id !== id) })
  }

  const generateNextJsCode = () => {
    if (!selectedMenu) return ""
    const itemsCode = selectedMenu.items
      .map((item) => {
        const href =
          item.type === "page"
            ? `/${pages.find((p) => p.id === item.pageId)?.slug || ""}`
            : item.url
        return `    { label: "${item.label}", href: "${href}" },`
      })
      .join("\n")
    const varName = selectedMenu.name.replace(/\s+/g, "")
    return `// layout.tsx - ${selectedMenu.location === "primary" ? "Header" : "Footer"} Navigation
const ${varName}Items = [
${itemsCode}
];

<nav className="${selectedMenu.location === "primary" ? "header-nav" : "footer-nav"}">
  {${varName}Items.map((item) => (
    <Link key={item.href} href={item.href}>
      {item.label}
    </Link>
  ))}
</nav>`
  }

  return (
    <div className="flex h-full">
      {/* Menu List */}
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-sans font-bold text-foreground">Menus</h2>
            <button
              onClick={createMenu}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <p className="text-xs font-mono text-muted-foreground">app/admin/menus/page.tsx</p>
        </div>
        <div className="p-2">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setSelectedMenu(menu)}
              className={`w-full text-left px-3 py-2 mb-1 transition-all ${
                selectedMenu?.id === menu.id
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="text-sm font-medium">{menu.name}</span>
              <span className="block text-xs font-mono text-muted-foreground/60">
                {menu.location !== "none" ? menu.location : "unassigned"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Editor */}
      {selectedMenu ? (
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {editingMenuName ? (
                <input
                  type="text"
                  value={selectedMenu.name}
                  onChange={(e) => updateMenu({ ...selectedMenu, name: e.target.value })}
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
                onClick={() => deleteMenu(selectedMenu.id)}
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
                {(["primary", "footer", "none"] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => updateMenu({ ...selectedMenu, location: loc })}
                    className={`px-4 py-2 text-sm font-medium transition-all ${
                      selectedMenu.location === loc
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {loc === "primary" ? "Primary Nav" : loc === "footer" ? "Footer Nav" : "None"}
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
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem(index, "down")}
                          disabled={index === selectedMenu.items.length - 1}
                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="ml-2 text-xs font-mono text-muted-foreground">
                          {item.type === "page"
                            ? `/${pages.find((p) => p.id === item.pageId)?.slug || ""}`
                            : item.url}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground">
                        {item.type}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
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
                    value={newItemPageId}
                    onChange={(e) => setNewItemPageId(e.target.value)}
                    className="w-full p-2 mb-3 bg-input text-foreground border border-border outline-none focus:border-primary"
                  >
                    <option value="">Select a page...</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
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
                    onClick={addMenuItem}
                    className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
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
                  <code className="font-mono text-sm text-foreground">{generateNextJsCode()}</code>
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
  )
}