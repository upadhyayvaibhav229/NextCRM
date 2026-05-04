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

export interface SiteSettings {
  id: number;
  siteName: string | null;
  siteTagline: string | null;
  logo: string | null;
  favicon: string | null;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  postsPerPage: number;
  createdAt: Date;
  updatedAt: Date;
}
