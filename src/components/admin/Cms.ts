export interface Page {
  id: string
  title: string
  slug: string
  status: "published" | "draft"
  modified: string
  html: string
  css: string
  js: string
}

export interface MenuItem {
  id: string
  label: string
  type: "page" | "custom"
  pageId?: string
  url?: string
  children: MenuItem[]
}

export interface MenuData {
  id: string
  name: string
  location: "primary" | "footer" | "none"
  items: MenuItem[]
}