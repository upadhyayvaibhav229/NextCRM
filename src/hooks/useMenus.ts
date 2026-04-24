import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────

interface MenuItem {
  id: number
  label: string
  type: 'page' | 'custom'
  slug: string | null
  url: string | null
  order: number
  menuId: number
}

interface Menu {
  id: number
  name: string
  location: string
  items: MenuItem[]
}

interface ReorderItem {
  id: number
  order: number
}

interface AddMenuItemInput {
  label: string
  type: 'page' | 'custom'
  slug?: string | null
  url?: string | null
}

interface UpdateMenuInput {
  name?: string
  location?: string
  items?: AddMenuItemInput[]
}

// ─── Hook ─────────────────────────────────────────────────

export function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([])   // ← typed here, fixes the error
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMenus()
  }, [])

  async function fetchMenus() {
    try {
      setLoading(true)
      const res = await fetch('/api/menus')
      const data = await res.json()
      setMenus(data.data)
    } catch (err) {
      setError('Failed to fetch menus')
    } finally {
      setLoading(false)
    }
  }

// accept input instead of hardcoding
async function createMenu(input: { name: string; location: string }): Promise<Menu> {
  const res = await fetch('/api/menus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      location: input.location,
      items: [],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)

  setMenus((prev) => [...prev, data.data])
  return data.data
}


  async function updateMenu(id: number, updates: UpdateMenuInput): Promise<Menu> {
    const res = await fetch(`/api/menus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    setMenus((prev) => prev.map((m) => (m.id === id ? data.data : m)))
    return data.data
  }

  async function deleteMenu(id: number): Promise<void> {
    const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    setMenus((prev) => prev.filter((m) => m.id !== id))
  }

  async function addMenuItem(menuId: number, item: AddMenuItemInput): Promise<MenuItem> {
    const res = await fetch(`/api/menus/${menuId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    await refreshMenu(menuId)
    return data.data
  }

  async function deleteMenuItem(menuId: number, itemId: number): Promise<void> {
    const res = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    await refreshMenu(menuId)
  }

  async function reorderMenuItems(menuId: number, items: ReorderItem[]): Promise<void> {
    const res = await fetch(`/api/menus/${menuId}/items`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    await refreshMenu(menuId)
  }

  async function refreshMenu(menuId: number): Promise<Menu> {
    const res = await fetch(`/api/menus/${menuId}`)
    const data = await res.json()
    setMenus((prev) => prev.map((m) => (m.id === menuId ? data.data : m)))
    return data.data
  }

  return {
    menus,
    loading,
    error,
    createMenu,
    updateMenu,
    deleteMenu,
    addMenuItem,
    deleteMenuItem,
    reorderMenuItems,
    refreshMenu,
  }
}