"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  FileText,
  Menu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  Eye,
  LogOut,
  User,
  Code,
  Check,
} from "lucide-react"
import { GlobalCssEditor } from "@/components/global-css-editor"

// Types
interface Page {
  id: string
  title: string
  slug: string
  status: "published" | "draft"
  modified: string
  html: string
  css: string
  js: string
}

interface MenuItem {
  id: string
  label: string
  type: "page" | "custom"
  pageId?: string
  url?: string
  children: MenuItem[]
}

interface MenuData {
  id: string
  name: string
  location: "primary" | "footer" | "none"
  items: MenuItem[]
}

// Sample pages data
const initialPages: Page[] = [
  {
    id: "1",
    title: "Home",
    slug: "home",
    status: "published",
    modified: "2024-01-15",
    html: `<section class="hero">
  <h1>Welcome to Our Platform</h1>
  <p>Build amazing things with modern tools</p>
  <button class="cta">Get Started</button>
</section>

<section class="features">
  <div class="feature">
    <h3>Fast</h3>
    <p>Lightning quick performance</p>
  </div>
  <div class="feature">
    <h3>Secure</h3>
    <p>Enterprise-grade security</p>
  </div>
</section>`,
    css: `.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.cta {
  background: white;
  color: #667eea;
  padding: 1rem 2rem;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.features {
  display: flex;
  gap: 2rem;
  padding: 4rem 2rem;
  justify-content: center;
}

.feature {
  text-align: center;
  padding: 2rem;
  background: #f5f5f5;
}`,
    js: `document.querySelector('.cta').addEventListener('click', () => {
  alert('Welcome aboard!');
});`,
  },
  {
    id: "2",
    title: "About Us",
    slug: "about",
    status: "published",
    modified: "2024-01-14",
    html: `<div class="about-container">
  <h1>About Our Company</h1>
  <p class="intro">We are a team of passionate developers building the future of web.</p>
  
  <div class="team">
    <div class="member">
      <div class="avatar">JD</div>
      <h4>John Doe</h4>
      <p>Founder & CEO</p>
    </div>
    <div class="member">
      <div class="avatar">JS</div>
      <h4>Jane Smith</h4>
      <p>CTO</p>
    </div>
  </div>
</div>`,
    css: `.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.about-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.intro {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
}

.team {
  display: flex;
  gap: 2rem;
}

.member {
  text-align: center;
  padding: 2rem;
  background: #f9f9f9;
  flex: 1;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}`,
    js: `// About page interactions
console.log('About page loaded');`,
  },
  {
    id: "3",
    title: "Services",
    slug: "services",
    status: "draft",
    modified: "2024-01-13",
    html: `<div class="services-page">
  <h1>Our Services</h1>
  
  <div class="service-grid">
    <div class="service-card">
      <span class="icon">🚀</span>
      <h3>Web Development</h3>
      <p>Custom websites and web applications</p>
      <span class="price">From $5,000</span>
    </div>
    <div class="service-card">
      <span class="icon">📱</span>
      <h3>Mobile Apps</h3>
      <p>iOS and Android applications</p>
      <span class="price">From $10,000</span>
    </div>
    <div class="service-card">
      <span class="icon">☁️</span>
      <h3>Cloud Solutions</h3>
      <p>Scalable cloud infrastructure</p>
      <span class="price">Custom Quote</span>
    </div>
  </div>
</div>`,
    css: `.services-page {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.services-page h1 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.service-card {
  background: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.price {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}`,
    js: `document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    card.style.background = '#f0f0ff';
  });
});`,
  },
  {
    id: "4",
    title: "Contact",
    slug: "contact",
    status: "published",
    modified: "2024-01-12",
    html: `<div class="contact-page">
  <h1>Get In Touch</h1>
  
  <form class="contact-form">
    <div class="form-group">
      <label>Name</label>
      <input type="text" placeholder="Your name" />
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" placeholder="your@email.com" />
    </div>
    <div class="form-group">
      <label>Message</label>
      <textarea placeholder="Your message..."></textarea>
    </div>
    <button type="submit">Send Message</button>
  </form>
</div>`,
    css: `.contact-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.contact-page h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.contact-form {
  background: #f9f9f9;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
}

button[type="submit"] {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

button[type="submit"]:hover {
  background: #5a67d8;
}`,
    js: `document.querySelector('.contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Message sent! We will get back to you soon.');
});`,
  },
]

const initialMenus: MenuData[] = [
  {
    id: "1",
    name: "Primary Navigation",
    location: "primary",
    items: [
      { id: "m1", label: "Home", type: "page", pageId: "1", children: [] },
      { id: "m2", label: "About", type: "page", pageId: "2", children: [] },
      { id: "m3", label: "Services", type: "page", pageId: "3", children: [] },
      { id: "m4", label: "Contact", type: "page", pageId: "4", children: [] },
    ],
  },
  {
    id: "2",
    name: "Footer Links",
    location: "footer",
    items: [
      { id: "f1", label: "Privacy Policy", type: "custom", url: "/privacy", children: [] },
      { id: "f2", label: "Terms of Service", type: "custom", url: "/terms", children: [] },
    ],
  },
]

// Sidebar Component
function Sidebar({
  activeSection,
  setActiveSection,
  collapsed,
  setCollapsed,
}: {
  activeSection: string
  setActiveSection: (section: string) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { id: "pages", label: "Pages", icon: FileText, path: "/admin/pages" },
    { id: "menus", label: "Menus", icon: Menu, path: "/admin/menus" },
    { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
    { id: "global-css", label: "Global CSS", icon: Code, path: "/admin/setting/global-css" },
  ]

  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-sans font-bold text-lg text-foreground tracking-tight">CMS</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-all duration-200 relative ${
                isActive
                  ? "text-primary bg-sidebar-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary glow-accent" />
              )}
              <Icon size={18} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!collapsed && (
                <span className="ml-auto text-[10px] font-mono text-muted-foreground/60">
                  {item.path}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@cms.dev</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

// Dashboard Section (Placeholder)
function DashboardSection() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm font-mono text-muted-foreground">app/admin/page.tsx</p>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "Total Pages", value: "4", change: "+2 this week" },
          { label: "Published", value: "3", change: "75% of total" },
          { label: "Draft", value: "1", change: "1 pending review" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-xs font-mono text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Pages Section
function PagesSection({
  pages,
  setPages,
}: {
  pages: Page[]
  setPages: (pages: Page[]) => void
}) {
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Sync pages to localStorage for preview page to access
  useEffect(() => {
    localStorage.setItem("cms_pages", JSON.stringify(pages))
  }, [pages])

  const openPreview = () => {
    if (!editingPage) return
    // Save current editing state to localStorage before opening preview
    const updatedPages = pages.map((p) =>
      p.id === editingPage.id ? editingPage : p
    )
    const isNewPage = !pages.find((p) => p.id === editingPage.id)
    const allPages = isNewPage ? [...pages, editingPage] : updatedPages
    localStorage.setItem("cms_pages", JSON.stringify(allPages))
    // Open preview in new tab
    window.open(`/preview/${editingPage.slug}`, "_blank")
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const createNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: "New Page",
      slug: "new-page",
      status: "draft",
      modified: new Date().toISOString().split("T")[0],
      html: "<h1>New Page</h1>\n<p>Start editing...</p>",
      css: "h1 {\n  color: #333;\n}",
      js: "// Your JavaScript here",
    }
    setEditingPage(newPage)
  }

  const savePage = () => {
    if (!editingPage) return
    const existingIndex = pages.findIndex((p) => p.id === editingPage.id)
    const updatedPage = {
      ...editingPage,
      modified: new Date().toISOString().split("T")[0],
    }
    if (existingIndex >= 0) {
      const newPages = [...pages]
      newPages[existingIndex] = updatedPage
      setPages(newPages)
    } else {
      setPages([...pages, updatedPage])
    }
    setEditingPage(null)
  }

  const deletePage = (id: string) => {
    setPages(pages.filter((p) => p.id !== id))
    setDeleteConfirm(null)
  }

  if (editingPage) {
    return (
      <div className="flex flex-col h-full">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditingPage(null)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
            <div>
              <input
                type="text"
                value={editingPage.title}
                onChange={(e) => {
                  setEditingPage({
                    ...editingPage,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }}
                className="bg-transparent text-lg font-bold text-foreground border-none outline-none w-full"
                placeholder="Page Title"
              />
              <p className="font-mono text-xs text-muted-foreground">
                /pages/{editingPage.slug} → app/[slug]/page.tsx
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setEditingPage({
                  ...editingPage,
                  status: editingPage.status === "published" ? "draft" : "published",
                })
              }
              className={`px-3 py-1.5 text-sm font-medium transition-all ${
                editingPage.status === "published"
                  ? "bg-success/20 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {editingPage.status === "published" ? "Published" : "Draft"}
            </button>
            <button
              onClick={openPreview}
              className="flex items-center gap-2 px-4 py-1.5 bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={savePage}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Check size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Editor Content - Full Width Code Editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/30">
              {(["html", "css", "js"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-mono uppercase transition-colors ${
                    activeTab === tab
                      ? "text-primary border-b-2 border-primary bg-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="flex-1" />
              <div className="flex items-center gap-2 px-4 text-xs font-mono text-muted-foreground">
                <Eye size={14} />
                Click Preview to open in new tab
              </div>
            </div>
            {/* Code Area */}
            <div className="flex-1 relative">
              <textarea
                value={editingPage[activeTab]}
                onChange={(e) =>
                  setEditingPage({ ...editingPage, [activeTab]: e.target.value })
                }
                className="code-editor absolute inset-0 w-full h-full p-4 bg-code-bg text-foreground resize-none border-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground mb-1">Pages</h1>
          <p className="text-sm font-mono text-muted-foreground">app/admin/pages/page.tsx</p>
        </div>
        <button
          onClick={createNewPage}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          New Page
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Slug</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Modified</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <span className="font-medium text-foreground">{page.title}</span>
                </td>
                <td className="p-4">
                  <code className="font-mono text-sm text-muted-foreground">/{page.slug}</code>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                      page.status === "published"
                        ? "bg-success/20 text-success glow-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-mono text-sm text-muted-foreground">{page.modified}</span>
                </td>
                <td className="p-4 text-right">
                  {deleteConfirm === page.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">Delete?</span>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="px-2 py-1 text-xs bg-destructive text-destructive-foreground"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs bg-muted text-muted-foreground"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingPage(page)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(page.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Menus Section
function MenusSection({
  menus,
  setMenus,
  pages,
}: {
  menus: MenuData[]
  setMenus: (menus: MenuData[]) => void
  pages: Page[]
}) {
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
    setMenus(menus.filter((m) => m.id !== id))
    setSelectedMenu(menus.find((m) => m.id !== id) || null)
  }

  const addMenuItem = () => {
    if (!selectedMenu) return
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: newItemLabel || (newItemType === "page" ? pages.find((p) => p.id === newItemPageId)?.title || "Item" : "Link"),
      type: newItemType,
      pageId: newItemType === "page" ? newItemPageId : undefined,
      url: newItemType === "custom" ? newItemUrl : undefined,
      children: [],
    }
    updateMenu({
      ...selectedMenu,
      items: [...selectedMenu.items, newItem],
    })
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
    updateMenu({
      ...selectedMenu,
      items: selectedMenu.items.filter((item) => item.id !== id),
    })
  }

  const generateNextJsCode = () => {
    if (!selectedMenu) return ""
    const itemsCode = selectedMenu.items
      .map((item) => {
        const href = item.type === "page" ? `/${pages.find((p) => p.id === item.pageId)?.slug || ""}` : item.url
        return `    { label: "${item.label}", href: "${href}" },`
      })
      .join("\n")
    return `// layout.tsx - ${selectedMenu.location === "primary" ? "Header" : "Footer"} Navigation
const ${selectedMenu.name.replace(/\s+/g, "")}Items = [
${itemsCode}
];

<nav className="${selectedMenu.location === "primary" ? "header-nav" : "footer-nav"}">
  {${selectedMenu.name.replace(/\s+/g, "")}Items.map((item) => (
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
            {/* Menu Header */}
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
                  <button
                    onClick={() => setNewItemType("page")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-all ${
                      newItemType === "page"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <FileText size={14} />
                    Page
                  </button>
                  <button
                    onClick={() => setNewItemType("custom")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-all ${
                      newItemType === "custom"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <LinkIcon size={14} />
                    Custom Link
                  </button>
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

// Settings Section (Placeholder)
function SettingsSection() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-sm font-mono text-muted-foreground">app/admin/settings/page.tsx</p>
      </div>
      
      <div className="max-w-2xl bg-card border border-border p-6">
        <h2 className="font-medium text-foreground mb-4">General Settings</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>Settings panel coming soon...</p>
          <p className="text-sm font-mono">Global CSS is available at /admin/setting/global-css.</p>
        </div>
      </div>
    </div>
  )
}

function GlobalCssSection() {
  return <GlobalCssEditor />
}

// Main App
export default function CMSAdminPanel() {
  const [activeSection, setActiveSection] = useState("pages")
  const [collapsed, setCollapsed] = useState(false)
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [menus, setMenus] = useState<MenuData[]>(initialMenus)

  // Sync pages and menus to localStorage for preview pages to access
  // This runs on every change AND on initial mount to ensure data is always available
  useEffect(() => {
    localStorage.setItem("cms_pages", JSON.stringify(pages))
  }, [pages])

  useEffect(() => {
    localStorage.setItem("cms_menus", JSON.stringify(menus))
  }, [menus])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className="flex-1 overflow-hidden dot-grid">
        {activeSection === "dashboard" && <DashboardSection />}
        {activeSection === "pages" && (
          <PagesSection pages={pages} setPages={setPages} />
        )}
        {activeSection === "menus" && (
          <MenusSection menus={menus} setMenus={setMenus} pages={pages} />
        )}
        {activeSection === "settings" && <SettingsSection />}
        {activeSection === "global-css" && <GlobalCssSection />}
      </main>
    </div>
  )
}
