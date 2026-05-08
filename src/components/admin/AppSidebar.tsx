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
  Sparkles,
  Newspaper,
  FolderOpen,
  Hash,
  PlusCircle,
  ChevronDown,
  Layout,
} from "lucide-react";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  description?: string;
  children?: NavItem[];
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
  {
    id: "posts",
    label: "Posts",
    icon: Newspaper,
    description: "Manage blog posts",
    children: [
      {
        id: "all-posts",
        label: "All Posts",
        icon: FileText,
        description: "View all posts",
      },
      {
        id: "categories",
        label: "Categories",
        icon: FolderOpen,
        description: "Manage categories",
      },
      {
        id: "tags",
        label: "Tags",
        icon: Hash,
        description: "Manage tags",
      },
    ],
  },
  {
    id: "media",
    label: "Media Library",
    icon: FileText,
    description: "Manage Media Library",
    children: [
      {
        id: "all-media",
        label: "Media Library",
        icon: FileText,
        description: "View all Medias",
      },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    icon: FileText,
    description: "Manage content",
  },
  {
    id: "menus",
    label: "Menus",
    icon: Menu,
    description: "Navigation structure",
  },
  {
    id: "global-css",
    label: "Global CSS",
    icon: Code,
    description: "Styling & themes",
  },

  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System configuration",
    children: [
      {
        id: "footer-settings",
        label: "Footer Setting",
        icon: Layout,
        description: "Styling & themes",
      },
    ],
  },
];

export function Sidebar({
  activeSection,
  setActiveSection,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const { data: session } = useSession();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const userEmail = session?.user?.email || "Logged in user";
  const userName = userEmail.includes("@")
    ? userEmail.split("@")[0]
    : userEmail;

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    const isHovered = hoveredItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);

    return (
      // app sidebar
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => {
            if (hasChildren && !collapsed) {
              // setActiveSection(item.id);
              toggleMenu(item.id);
            } else {
              setActiveSection(item.id);
            }
          }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
            depth > 0 ? "pl-10" : ""
          } ${
            isActive
              ? "bg-linear-to-r from-sidebar-primary/20 to-sidebar-primary/5 text-sidebar-primary shadow-sm"
              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
          }`}
        >
          {/* Active indicator */}
          {isActive && !hasChildren && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-sidebar-primary to-sidebar-primary/60 rounded-r-full glow-accent" />
          )}

          {/* Icon */}
          <div
            className={`relative transition-transform duration-200 ${
              isHovered && !collapsed ? "scale-110" : ""
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            {collapsed && isHovered && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-sidebar-foreground text-sidebar text-xs font-medium rounded-md whitespace-nowrap z-50 shadow-lg">
                {item.label}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-sidebar-foreground" />
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <span className="text-sm font-medium block truncate">
                {item.label}
              </span>
              {item.description && (
                <span className="text-[11px] text-sidebar-foreground/40 block truncate">
                  {item.description}
                </span>
              )}
            </div>
          )}

          {/* Expand/collapse icon for children */}
          {!collapsed && hasChildren && (
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Render children if expanded */}
        {!collapsed && hasChildren && isExpanded && (
          <div className="ml-4 space-y-1 border-l border-sidebar-border/50 pl-3">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Add this useEffect to inject styles for hiding scrollbar
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          !collapsed
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setCollapsed(true)}
      />

      <aside
        className={`fixed lg:relative flex flex-col h-screen bg-gradient-to-b from-sidebar to-sidebar/95 backdrop-blur-sm border-r border-sidebar-border transition-all duration-300 ease-in-out z-50 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Logo Section */}
        <div className="shrink-0 flex items-center h-16 px-5 border-b border-sidebar-border/50 bg-linear-to-r from-sidebar/50 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles size={18} className="text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-sans font-bold text-xl bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/80 bg-clip-text text-transparent">
                  CMS Admin
                </span>
                <div className="text-[10px] text-sidebar-foreground/40 font-mono">
                  v2.0.0
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation - Made scrollable with hidden scrollbar */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 hide-scrollbar">
          {navItems.map((item) => renderNavItem(item))}
        </div>

        {/* Bottom Section - Made sticky/always visible */}
        <div className="shrink-0 border-t border-sidebar-border/50 p-3 space-y-3 bg-gradient-to-b from-transparent to-sidebar/95">
          <div className="space-y-1">
            {/* Visit Site */}
            <a
              href="/"
              target="_blank"
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <ExternalLink size={18} strokeWidth={1.5} />
              {!collapsed && (
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium block">Visit Site</span>
                  <span className="text-[11px] text-sidebar-foreground/40 block">
                    View public site
                  </span>
                </div>
              )}
            </a>
            <ThemeToggle collapsed={collapsed} />
          </div>

          {/* User Profile */}
          <div className="group relative">
            <div
              className={`flex items-center gap-3 rounded-xl transition-all duration-200 ${
                !collapsed ? "p-2 hover:bg-sidebar-accent/30" : "justify-center"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary/30 to-sidebar-primary/10 flex items-center justify-center ring-2 ring-sidebar-primary/20 group-hover:ring-sidebar-primary/40 transition-all">
                  <User size={18} className="text-sidebar-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-sidebar" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/50 truncate">
                    {userEmail}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className={`rounded-lg text-sidebar-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 ${
                  collapsed
                    ? "absolute -right-1 -top-1 p-1 bg-sidebar"
                    : "p-1.5"
                }`}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-3 bottom-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                <div className="px-2 py-1 bg-sidebar-foreground text-sidebar text-xs font-medium rounded-md whitespace-nowrap shadow-lg">
                  {userName}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-sidebar-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Version info */}
          {!collapsed && (
            <div className="text-center">
              <p className="text-[10px] text-sidebar-foreground/30 font-mono">
                © 2024 CMS Platform
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
