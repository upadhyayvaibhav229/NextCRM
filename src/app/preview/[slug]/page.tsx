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
}

export default function PreviewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [page, setPage] = useState<Page | null>(null);
  const [globalCss, setGlobalCss] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Use the menus hook - no hardcoded menus!
  const { menus, loading: menusLoading } = useMenusPreview();

  // Handle navigation messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NAVIGATE" && typeof event.data.url === "string") {
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
    [menus]
  );
  
  const footerMenu = useMemo(
    () => menus.find((menu) => menu.location === "footer"), // "footer" matches your MenusSection
    [menus]
  );

  // Show loading state
  if (pageLoading || menusLoading) {
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
  const mapItems = (items, className) =>
    items
      .map((item) => {
        const href =
          item.type === "page" && item.slug 
            ? `/preview/${item.slug}` 
            : item.url || "#";

        return `<li><a href="${href}" class="${className}" onclick="handleNav(event, '${href}')">${item.label}</a></li>`;
      })
      .join("");

  // Generate full HTML for iframe
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} - My Website</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    body { display: flex; flex-direction: column; background: #ffffff; color: #111827; }
    .cms-navbar { position: sticky; top: 0; z-index: 10; background: #ffffff; border-bottom: 1px solid #e5e7eb; }
    .cms-navbar-inner, .cms-footer-inner { width: min(1200px, calc(100% - 2rem)); margin: 0 auto; }
    .cms-navbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; gap: 1rem; }
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
      <a href="/preview/home" class="cms-brand" onclick="handleNav(event, '/preview/home')">My Website</a>
      <ul class="cms-menu">${headerMenu ? mapItems(headerMenu.items, "cms-link") : ""}</ul>
    </div>
  </nav>
  <main class="cms-page-wrapper">
    ${page.html}
  </main>
  <footer class="cms-footer">
    <div class="cms-footer-inner">
      <ul class="cms-footer-menu">${footerMenu ? mapItems(footerMenu.items, "cms-footer-link") : ""}</ul>
      <p>&copy; ${new Date().getFullYear()} My Website. All rights reserved.</p>
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
      style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
    />
  );
}