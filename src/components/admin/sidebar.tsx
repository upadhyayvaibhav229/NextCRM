"use client";

import {
  LayoutDashboard,
  FileText,
  Menu,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Code,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  { id: "pages", label: "Pages", icon: FileText, path: "/admin/pages" },
  { id: "menus", label: "Menus", icon: Menu, path: "/admin/menus" },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
  {
    id: "global-css",
    label: "Global CSS",
    icon: Code,
    path: "/admin/setting/global-css",
  },
];

export function Sidebar({
  activeSection,
  setActiveSection,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  return (
    <aside
      className={`flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-sans font-bold text-lg text-foreground tracking-tight">
            CMS
          </span>
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
          const Icon = item.icon;
          const isActive = activeSection === item.id;
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
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 flex items-center justify-content-center">
            <User size={16} className="text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Admin
              </p>
              <p className="text-xs text-muted-foreground truncate">
                admin@cms.dev
              </p>
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
  );
}
