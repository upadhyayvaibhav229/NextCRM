import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Types matching the admin panel
interface MenuItem {
  id: string
  label: string
  type: "page" | "custom"
  pageId?: string
  slug?: string
  url?: string
  children: MenuItem[]
}

interface MenuData {
  id: string
  name: string
  location: "primary" | "footer" | "none"
  items: MenuItem[]
}

interface Page {
  id: string
  title: string
  slug: string
  status: "published" | "draft"
}

// Server-side storage using cookies as a simple persistence layer
// In production, you'd use a database
async function getMenusFromStorage(): Promise<MenuData[]> {
  const cookieStore = await cookies()
  const menusData = cookieStore.get("cms_menus")
  if (menusData) {
    try {
      return JSON.parse(menusData.value)
    } catch {
      return []
    }
  }
  return []
}

async function getPagesFromStorage(): Promise<Page[]> {
  const cookieStore = await cookies()
  const pagesData = cookieStore.get("cms_pages")
  if (pagesData) {
    try {
      return JSON.parse(pagesData.value)
    } catch {
      return []
    }
  }
  return []
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")

  const menus = await getMenusFromStorage()
  const pages = await getPagesFromStorage()

  // Enrich menu items with page slugs
  const enrichedMenus = menus.map((menu) => ({
    ...menu,
    items: menu.items.map((item) => {
      if (item.type === "page" && item.pageId) {
        const page = pages.find((p) => p.id === item.pageId)
        return {
          ...item,
          slug: page?.slug || "",
        }
      }
      return item
    }),
  }))

  if (location) {
    const menu = enrichedMenus.find((m) => m.location === location)
    return NextResponse.json(menu || null)
  }

  return NextResponse.json(enrichedMenus)
}

export async function POST(request: NextRequest) {
  const { menus, pages } = await request.json()
  
  const response = NextResponse.json({ success: true })
  
  // Store in cookies (for demo - in production use a database)
  if (menus) {
    response.cookies.set("cms_menus", JSON.stringify(menus), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }
  
  if (pages) {
    response.cookies.set("cms_pages", JSON.stringify(pages), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return response
}
