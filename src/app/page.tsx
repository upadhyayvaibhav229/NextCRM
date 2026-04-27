"use client"

import { MenuData, Page } from "@/src/components/admin/Cms"
import { DashboardSection } from "@/src/components/admin/dashboard-section"
import { initialMenus, initialPages } from "@/src/components/admin/data"
import { MenusSection } from "@/src/components/admin/menus-section"
import { PagesSection } from "@/src/components/admin/pages-section"
import { GlobalCssSection, SettingsSection } from "@/src/components/admin/settings-section"
import { Sidebar } from "@/src/components/admin/sidebar"
import { useState, useEffect } from "react"



export default function CMSAdminPanel() {
  const [activeSection, setActiveSection] = useState("pages")
  const [collapsed, setCollapsed] = useState(false)
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [menus, setMenus] = useState<MenuData[]>(initialMenus)

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