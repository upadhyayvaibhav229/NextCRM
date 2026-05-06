"use client";

import { useEffect, useState } from "react";
import { MenuData, Page } from "@/src/components/admin/Cms";
import { DashboardSection } from "@/src/components/admin/dashboard-section";
import { initialMenus, initialPages } from "@/src/components/admin/data";
import { MenusSection } from "@/src/components/admin/menus-section";
import { PagesSection } from "@/src/components/admin/pages/pages-section";
import { CategoryTable } from "@/src/components/admin/category/category-table";
import { PostsSection } from "@/src/components/admin/posts/PostSection";
import {
  GlobalCssSection,
  SettingsSection,
} from "@/src/components/admin/settings-section";
import { Sidebar } from "@/src/components/admin/AppSidebar";
import { TagTable } from "@/src/components/admin/tags/Tags";
import AdminSettings from "./setting/Page";
import { FooterSettingsSection } from "./FooterSettingSection";
import { MediaManager } from "../media-manager/MediaManager";

export function CMSAdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [menus, setMenus] = useState<MenuData[]>(initialMenus);

  useEffect(() => {
    localStorage.setItem("cms_pages", JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem("cms_menus", JSON.stringify(menus));
  }, [menus]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main className="flex-1 min-w-0 overflow-y-auto dot-grid p-2.5">
        {activeSection === "dashboard" && <DashboardSection />}
        {activeSection === "all-posts" && <PostsSection />}
        {activeSection === "all-media" && <MediaManager />}
        {activeSection === "categories" && (
          <div className="p-8">
            <CategoryTable />
          </div>
        )}
        {activeSection === "tags" && (
          <div className="p-8">
            <TagTable />
          </div>
        )}
        {activeSection === "pages" && (
          <PagesSection pages={pages} setPages={setPages} />
        )}
        {activeSection === "menus" && (
          <MenusSection menus={menus} setMenus={setMenus} pages={pages} />
        )}
        {activeSection === "footer-settings" && <FooterSettingsSection />}
        {activeSection === "settings" && <AdminSettings />}
        {activeSection === "global-css" && <GlobalCssSection />}
      </main>
    </div>
  );
}

