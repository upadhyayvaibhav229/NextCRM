"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMenusPreview } from "@/src/hooks/useMenusPreview";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  modified: string;
  html: string;
  css: string;
  js: string;
  seoData?: any; // ← add this
}

export default function PreviewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [page, setPage] = useState<Page | null>(null);
  const [globalCss, setGlobalCss] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  // Use the menus hook - no hardcoded menus!
  const { menus, loading: menusLoading } = useMenusPreview();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/setting");
        const data = await res.json();

        if (data.success) {
          setSettings(data.data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };

    fetchSettings();
  }, []);
  // Handle navigation messages from iframe
  useEffect(() => {

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "NAVIGATE" &&
        typeof event.data.url === "string"
      ) {
        router.push(event.data.url);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  // Fetch page by slug
  useEffect(() => {
    const fetchPage = async () => {
      try {
        if (!slug) return;

        const res = await fetch(`/api/pages/slug/${slug}`);
        const data = await res.json();

        console.log("API Response:", data);

        if (data.success && data.data) {
          setPage(data.data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load page:", err);
        setNotFound(true);
      } finally {
        setPageLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  // Get header and footer menus - match your MenusSection locations
  const headerMenu = useMemo(
    () => menus.find((menu) => menu.location === "header"), // "header" matches your MenusSection
    [menus],
  );

  const footerMenu = useMemo(
    () => menus.find((menu) => menu.location === "footer"), // "footer" matches your MenusSection
    [menus],
  );

  // Show loading state
  if (pageLoading || menusLoading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading...
      </div>
    );
  }

  // Show 404 if page not found
  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="mt-3 text-lg text-gray-600">Page not found: /{slug}</p>
        </div>
      </div>
    );
  }

  // Show loading if no page yet
  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading page...
      </div>
    );
  }

  // Map menu items to HTML
  const buildTree = (items: any[]) => {
    const map = new Map();

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    const roots: any[] = [];

    items.forEach((item) => {
      if (item.parentId) {
        map.get(item.parentId)?.children.push(map.get(item.id));
      } else {
        roots.push(map.get(item.id));
      }
    });

    return roots;
  };

  const mapItems = (items: any[], className: string): string => {
    return items
      .map((item) => {
        const href =
          item.type === "page" && item.slug ? `/${item.slug}` : item.url || "#";

        const childrenHtml =
          item.children?.length > 0
            ? `<ul class="cms-submenu">${mapItems(item.children, className)}</ul>`
            : "";

        return `
        <li>
          <a href="${href}" class="${className}" onclick="handleNav(event, '${href}')">
            ${item.label}
          </a>
          ${childrenHtml}
        </li>
      `;
      })
      .join("");
  };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const seo = (page as any).seoData || {};
  // Generate full HTML for iframe
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.metaTitle || page.title}</title>
  <meta name="description" content="${seo.metaDescription || ""}">
  ${settings.favicon ? `<link rel="icon" href="${settings.favicon}" />` : ""}
  <!-- Robots -->
  <meta name="robots" content="${
    (seo.robotsIndex !== false ? "index" : "noindex") +
    "," +
    (seo.robotsFollow !== false ? "follow" : "nofollow")
  }">

  <!-- Canonical -->
  ${seo.canonicalUrl ? `<link rel="canonical" href="${seo.canonicalUrl}">` : `<link rel="canonical" href="${siteUrl}/${page.slug}">`}

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${siteUrl}/${page.slug}">
    <meta property="og:title" content="${seo.ogTitle || seo.metaTitle || page.title}">
    <meta property="og:description" content="${seo.ogDescription || seo.metaDescription || ""}">
    ${seo.ogImage ? `<meta property="og:image" content="${seo.ogImage}">` : ""}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seo.twitterTitle || seo.ogTitle || page.title}">
    <meta name="twitter:description" content="${seo.twitterDescription || seo.metaDescription || ""}">
    ${seo.twitterImage || seo.ogImage ? `<meta name="twitter:image" content="${seo.twitterImage || seo.ogImage}">` : ""}  
    <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    body { display: flex; flex-direction: column; background: #ffffff; color: #111827; }
 /* === NAVBAR === */
.cms-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.cms-navbar-inner, .cms-footer-inner {
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
}
.cms-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  gap: 1rem;
}
.cms-brand {
  color: #111827;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
}

/* === TOP-LEVEL MENU === */
.cms-menu {
  display: flex;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}
.cms-menu > li {
  position: relative;
}

/* === TOP-LEVEL LINKS === */
.cms-link {
  display: block;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.cms-link:hover {
  background: #f3f4f6;
  color: #111827;
}

/* === SUBMENU INDICATOR ARROW === */
.cms-menu > li:has(.cms-submenu) > .cms-link::after {
  content: '';
  display: inline-block;
  margin-left: 6px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid currentColor;
  vertical-align: middle;
  opacity: 0.6;
  transition: transform 0.2s;
}
.cms-menu > li:has(.cms-submenu):hover > .cms-link::after {
  transform: rotate(180deg);
}

/* === DROPDOWN SUBMENU === */
/* Remove the gap-based offset */
.cms-submenu {
  position: absolute;
  top: 100%;          /* ← was calc(100% + 6px) */
  left: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
  list-style: none;
  margin: 0;
  padding: 0.375rem;
  padding-top: 10px;   /* ← visual gap via padding, not margin */
  opacity: 0;
  visibility: hidden;
  transform: translateY(0);  /* ← remove the translateY so no actual gap */
  transition: opacity 0.18s ease, visibility 0.18s;
  pointer-events: none;
  z-index: 200;
}

/* Show on hover */
.cms-menu > li:hover > .cms-submenu,
.cms-submenu li:hover > .cms-submenu {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Invisible bridge so mouse doesn't "leave" the li when crossing the gap */
.cms-menu > li::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 10px;
  background: transparent;
}
/* === NESTED SUBMENU (level 3+) === */
.cms-submenu .cms-submenu {
  top: -0.375rem;
  left: calc(100% + 6px);
  transform: translateX(-6px) translateY(0);
}
.cms-submenu li:hover > .cms-submenu {
  transform: translateX(0) translateY(0);
}
.cms-submenu li {
  position: relative;
}

/* === SUBMENU LINKS === */
.cms-submenu a {
  display: block;
  padding: 0.5rem 0.875rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 450;
  border-radius: 7px;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}
.cms-submenu a:hover {
  background: #f3f4f6;
  color: #111827;
}

/* === NESTED INDICATOR ARROW === */
.cms-submenu li:has(.cms-submenu) > a::after {
  content: '';
  float: right;
  margin-top: 6px;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 4px solid currentColor;
  opacity: 0.5;
}
    .cms-brand { color: #111827; text-decoration: none; font-size: 1.25rem; font-weight: 700; }
    .cms-menu, .cms-footer-menu { display: flex; gap: 1.5rem; list-style: none; margin: 0; padding: 0; }
    .cms-link { color: #4b5563; text-decoration: none; font-weight: 500; }
    .cms-link:hover { color: #111827; }
    .cms-page-wrapper { flex: 1; min-height: calc(100vh - 140px); }
    .cms-footer { margin-top: auto; background: #111827; color: #9ca3af; }
    .cms-footer-inner { padding: 2rem 0; text-align: center; }
    .cms-footer-link { color: #9ca3af; text-decoration: none; font-size: 0.875rem; }
    .cms-footer-link:hover { color: #ffffff; }
    ${globalCss}
    ${page.css}
  </style>
</head>
<body>
  <nav class="cms-navbar">
    <div class="cms-navbar-inner">
<a href="/home" class="cms-brand" onclick="handleNav(event, '/home')">
  ${
    settings.logo
      ? `<img src="${settings.logo}" alt="${settings.siteName}" style="height:40px;" />`
      : settings.siteName
  }
</a>
<ul class="cms-menu">
  ${headerMenu ? mapItems(buildTree(headerMenu.items), "cms-link") : ""}
</ul>   
 </div>
  </nav>
  <main class="cms-page-wrapper">
    ${page.html}
  </main>
  <footer class="cms-footer">
    <div class="cms-footer-inner">
<ul class="cms-footer-menu">
  ${footerMenu ? mapItems(buildTree(footerMenu.items), "cms-footer-link") : ""}
</ul>     
<p>
  ${
    settings.footerText ||
    `&copy; ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`
  }
</p>
    </div>
  </footer>
  <script>
    function handleNav(event, url) {
      event.preventDefault();
      window.parent.postMessage({ type: "NAVIGATE", url: url }, "*");
    }
    ${page.js}
  </script>
</body>
</html>`;

  return (
    <iframe
      srcDoc={fullHtml}
      title={page.title}
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}
