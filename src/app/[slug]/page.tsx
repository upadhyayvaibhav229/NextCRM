"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useMenusPreview } from "@/src/hooks/useMenusPreview";
import { Button } from "@/src/ui/button";
import { buildAdminToolbarHtml } from "@/src/lib/admin-toolbar";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  modified: string;
  html: string;
  css: string;
  js: string;
  seoData?: any;
}

const DEFAULT_FOOTER_SETTINGS = {
  footerLogo: "",
  footerBrandTitle: "",
  footerDescription: "",
  footerAddress: "",
  footerEmail: "",
  footerCopyright: "",
  socialLinks: [],
};

export default function PreviewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug;

  const [page, setPage] = useState<Page | null>(null);
  const [globalCss, setGlobalCss] = useState(""); // ← already declared ✅
  const [notFound, setNotFound] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(
    DEFAULT_FOOTER_SETTINGS,
  );
  const [footerMenus, setFooterMenus] = useState<any[]>([]);
  const [isPostsPage, setIsPostsPage] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  const { menus, loading: menusLoading } = useMenusPreview();

  // ── Fetch footer menus ──
  useEffect(() => {
    const fetchMenus = async () => {
      const res = await fetch("/api/menus");
      const data = await res.json();
      const cols = (data.data ?? []).filter(
        (m: any) => m.location === "footer",
      );
      setFooterMenus(cols);
    };
    fetchMenus();
  }, []);

  // ── Fetch footer settings ──
  useEffect(() => {
    const fetchFooterSettings = async () => {
      const res = await fetch("/api/footer-setting");
      const data = await res.json();
      if (data.success) {
        setFooterSettings({
          ...DEFAULT_FOOTER_SETTINGS,
          ...(data.data?.footer ?? {}),
        });
      }
    };
    fetchFooterSettings();
  }, []);

  // ── Fetch global CSS ── ← ADD THIS
  useEffect(() => {
    const fetchGlobalCss = async () => {
      try {
        const res = await fetch("/api/setting/global-css");
        const data = await res.json();
        if (data.success) setGlobalCss(data.data?.css || "");
      } catch (err) {
        console.error("Failed to load global CSS:", err);
      }
    };
    fetchGlobalCss();
  }, []);

  // ── Handle iframe navigation ──
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

  // ── Fetch page + site settings ──
  useEffect(() => {
    const fetchPage = async () => {
      try {
        if (!slug) return;

        const [pageRes, settingsRes] = await Promise.all([
          fetch(`/api/pages/slug/${slug}`),
          fetch("/api/setting"),
        ]);

        const data = await pageRes.json();
        const settingsData = await settingsRes.json();
        const siteSettings = settingsData.data;
        setSettings(siteSettings);

        if (data.success && data.data) {
          setPage(data.data);
          setNotFound(false);

          if (
            siteSettings?.postsPageId &&
            data.data.id === siteSettings.postsPageId
          ) {
            setIsPostsPage(true);
            const postsRes = await fetch("/api/posts");
            const postsData = await postsRes.json();
            const published = (postsData.data ?? []).filter(
              (p: any) => p.status === "PUBLISHED",
            );
            setPosts(published);
          }
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
    if (slug) fetchPage();
  }, [slug]);

  const headerMenu = useMemo(
    () => menus.find((menu) => menu.location === "header"),
    [menus],
  );

  const footerMenu = useMemo(
    () => menus.find((menu) => menu.location === "footer"),
    [menus],
  );

  if (pageLoading || menusLoading || !settings || !footerSettings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="mt-3 text-lg text-gray-600">Page not found: /{slug}</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading page...
      </div>
    );
  }

  // ── Helpers ──

  const buildTree = (items: any[]) => {
    const map = new Map();
    items.forEach((item) => map.set(item.id, { ...item, children: [] }));
    const roots: any[] = [];
    items.forEach((item) => {
      if (item.parentId)
        map.get(item.parentId)?.children.push(map.get(item.id));
      else roots.push(map.get(item.id));
    });
    return roots;
  };

  const mapItems = (items: any[], className: string): string =>
    items
      .map((item) => {
        const href =
          item.type === "page" && item.slug ? `/${item.slug}` : item.url || "#";
        const childrenHtml =
          item.children?.length > 0
            ? `<ul class="cms-submenu">${mapItems(item.children, className)}</ul>`
            : "";
        return `
        <li>
          <a href="${href}" class="${className}" onclick="handleNav(event,'${href}')">
            ${item.label}
          </a>
          ${childrenHtml}
        </li>`;
      })
      .join("");

  const renderFooterColumns = (menus: any[]): string =>
    menus
      .flatMap((menu) => buildTree(menu.items))
      .map((section: any) => {
        const links = (section.children || [])
          .map((child: any) => {
            const href =
              child.type === "page" && child.slug
                ? `/${child.slug}`
                : child.url || "#";
            return `<li><a href="${href}" class="footer-col-link" onclick="handleNav(event,'${href}')">${child.label}</a></li>`;
          })
          .join("");
        if (!links) return "";
        return `
          <div class="footer-col">
            <h4 class="footer-col-title">${section.label}</h4>
            <ul class="footer-col-links">${links}</ul>
          </div>`;
      })
      .join("");

  const footer = {
    ...DEFAULT_FOOTER_SETTINGS,
    ...footerSettings,
    footerBrandTitle:
      footerSettings.footerBrandTitle || settings.siteName || "My Website",
    footerCopyright:
      footerSettings.footerCopyright ||
      `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`,
  };

  const renderFooterBrand = (): string => `
    <div class="footer-brand">
      ${
        footer.footerLogo
          ? `<a href="/" onclick="handleNav(event,'/')"><img src="${footer.footerLogo}" alt="${footer.footerBrandTitle}" class="footer-logo" /></a>`
          : ""
      }
      ${
        footer.footerBrandTitle
          ? `<a href="/" class="footer-brand-name" onclick="handleNav(event,'/')">${footer.footerBrandTitle}</a>`
          : ""
      }
      ${
        footer.footerDescription
          ? `<p class="footer-brand-desc">${footer.footerDescription}</p>`
          : ""
      }
    </div>`;

  const renderFooterContact = (): string => `
    <div class="footer-contact">
      <h4 class="footer-col-title">Contact Us</h4>
      ${footer.footerAddress ? `<p class="footer-contact-text">${footer.footerAddress.replace(/\n/g, "<br>")}</p>` : ""}
      ${footer.footerEmail ? `<a href="mailto:${footer.footerEmail}" class="footer-contact-link">${footer.footerEmail}</a>` : ""}
      ${
        footer.socialLinks?.length
          ? `<div class="footer-social">
            ${footer.socialLinks
              .filter((link: any) => link.url)
              .map(
                (link: any) => `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="${link.platform}">
                  ${
                    link.icon
                      ? `<img src="${link.icon}" class="footer-social-icon" alt="${link.platform}" />`
                      : `<span>${link.platform}</span>`
                  }
                </a>`,
              )
              .join("")}
           </div>`
          : ""
      }
    </div>`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const seo = (page as any).seoData || {};
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const adminToolbarHtml =
    settings?.showAdminToolbar && isAdmin
      ? buildAdminToolbarHtml({
          pageId: page.id,
          siteName: settings.siteName,
        })
      : "";

  // ── Shared CSS ──
  const sharedCss = `
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    body { display: flex; flex-direction: column; background: #ffffff; color: #111827; }

    /* ── Navbar ── */
    .cms-navbar { position: sticky; top: 0; z-index: 100; background: #ffffff; border-bottom: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .cms-navbar-inner, .cms-footer-inner { width: min(1200px, calc(100% - 2rem)); margin: 0 auto; }
    .cms-navbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; gap: 1rem; }
    .cms-brand { color: #111827; text-decoration: none; font-size: 1.25rem; font-weight: 700; white-space: nowrap; }
    .cms-menu { display: flex; gap: 0.25rem; list-style: none; margin: 0; padding: 0; align-items: center; }
    .cms-menu > li { position: relative; }
    .cms-link { display: block; color: #374151; text-decoration: none; font-weight: 500; font-size: 0.9rem; padding: 0.5rem 0.75rem; border-radius: 6px; transition: background 0.15s, color 0.15s; white-space: nowrap; }
    .cms-link:hover { background: #f3f4f6; color: #111827; }
    .cms-menu > li:has(.cms-submenu) > .cms-link::after { content: ''; display: inline-block; margin-left: 6px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid currentColor; vertical-align: middle; opacity: 0.6; transition: transform 0.2s; }
    .cms-menu > li:has(.cms-submenu):hover > .cms-link::after { transform: rotate(180deg); }
    .cms-submenu { position: absolute; top: 100%; left: 0; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.10); list-style: none; margin: 0; padding: 0.375rem; padding-top: 10px; opacity: 0; visibility: hidden; transition: opacity 0.18s, visibility 0.18s; pointer-events: none; z-index: 200; }
    .cms-menu > li:hover > .cms-submenu, .cms-submenu li:hover > .cms-submenu { opacity: 1; visibility: visible; pointer-events: auto; }
    .cms-menu > li::after { content: ''; position: absolute; bottom: -10px; left: 0; right: 0; height: 10px; background: transparent; }
    .cms-submenu .cms-submenu { top: -0.375rem; left: calc(100% + 6px); }
    .cms-submenu li { position: relative; }
    .cms-submenu a { display: block; padding: 0.5rem 0.875rem; color: #374151; text-decoration: none; font-size: 0.875rem; border-radius: 7px; transition: background 0.12s; }
    .cms-submenu a:hover { background: #f3f4f6; color: #111827; }

    /* ── Footer ── */
    .cms-footer { margin-top: auto; background: #fff; color: #6c757d; border-top: 1px solid #e5e7eb; }
    .cms-footer-inner { width: min(1200px, calc(100% - 2rem)); margin: 0 auto; padding: 3rem 0 1.5rem; }
    .footer-top { display: grid; grid-template-columns: minmax(180px,1fr) minmax(180px,1fr) minmax(260px,2fr); gap: 3rem; margin-bottom: 2rem; align-items: start; }
    .footer-brand { display: flex; flex-direction: column; align-items: flex-start; }
    .footer-logo { max-width: 140px; height: auto; margin-bottom: 1rem; }
    .footer-brand-name { color: #111827; text-decoration: none; font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
    .footer-brand-desc { font-size: 0.875rem; color: #6c757d; margin: 0; line-height: 1.5; }
    .footer-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 2rem; width: 100%; }
    .footer-col-title { color: #111827; font-size: 0.875rem; font-weight: 600; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .footer-col-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .footer-col-link { color: #6c757d; text-decoration: none; font-size: 0.875rem; transition: color 0.15s; }
    .footer-col-link:hover { color: #111827; }
    .footer-contact { display: flex; flex-direction: column; align-items: flex-start; }
    .footer-contact-text { font-size: 0.875rem; color: #6c757d; margin: 0 0 0.5rem; line-height: 1.5; }
    .footer-contact-link { color: #6c757d; text-decoration: none; font-size: 0.875rem; margin-bottom: 1rem; transition: color 0.15s; }
    .footer-contact-link:hover { color: #111827; }
    .footer-social { display: flex; gap: 1rem; margin-top: 0.5rem; }
    .footer-social-link { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; transition: opacity 0.15s; }
    .footer-social-link:hover { opacity: 0.8; }
    .footer-social-icon { width: 20px; height: 20px; object-fit: contain; }
    .footer-bottom { border-top: 1px solid #e5e7eb; padding-top: 1.5rem; text-align: center; font-size: 0.75rem; color: #9ca3af; }
    @media (max-width: 900px) { .footer-top { grid-template-columns: 1fr; gap: 2rem; } .footer-cols { grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); } }
  `;

  // ── Shared head tags ──
  const sharedHead = (title: string, extraMeta = "") => `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${settings.favicon ? `<link rel="icon" href="${settings.favicon}" />` : ""}
    <script src="https://cdn.tailwindcss.com"></script>
    ${extraMeta}
    <style>
      ${sharedCss}
      /* ── Global CSS ── */
      ${globalCss || ""}
    </style>
  `;

  // ── Shared navbar + footer ──
  const sharedNavbar = `
    <nav class="cms-navbar">
      <div class="cms-navbar-inner">
        <a href="/home" class="cms-brand" onclick="handleNav(event,'/home')">
          ${
            settings.logo
              ? `<img src="${settings.logo}" alt="${settings.siteName}" style="height:40px;object-fit:contain;" />`
              : settings.siteName
          }
        </a>
        <ul class="cms-menu">
          ${headerMenu ? mapItems(buildTree(headerMenu.items), "cms-link") : ""}
        </ul>
      </div>
    </nav>`;

  const sharedFooter = `
    <footer class="cms-footer">
      <div class="cms-footer-inner">
        <div class="footer-top">
          ${renderFooterBrand()}
          ${renderFooterContact()}
          <div class="footer-cols">
            ${renderFooterColumns(footerMenus)}
          </div>
        </div>
        <div class="footer-bottom">
          <p>${footer.footerCopyright}</p>
        </div>
      </div>
    </footer>`;

  const sharedScript = `
    <script>
      function handleNav(event, url) {
        event.preventDefault();
        window.parent.postMessage({ type: "NAVIGATE", url: url }, "*");
      }
    </script>`;

  // ── Posts page ──
  if (isPostsPage && page && settings) {
    const postsHtml =
      posts.length === 0
        ? `<div class="empty"><p>No posts published yet.</p></div>`
        : posts
            .map(
              (post) => `
          <article class="post-card">
            ${
              post.featuredImage
                ? `<a href="/posts/${post.slug}" onclick="handleNav(event,'/posts/${post.slug}')">
                  <img src="${post.featuredImage}" alt="${post.title}" class="post-image" />
                 </a>`
                : ""
            }
            <div class="post-body">
              ${
                post.categories?.length
                  ? `<div class="post-cats">${post.categories.map((c: any) => `<span class="post-cat">${c.name}</span>`).join("")}</div>`
                  : ""
              }
              <h2 class="post-title">
                <a href="/posts/${post.slug}" onclick="handleNav(event,'/posts/${post.slug}')">${post.title}</a>
              </h2>
              ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ""}
              <div class="post-footer-row">
                ${
                  post.publishedAt
                    ? `<span class="post-date">${new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>`
                    : ""
                }
                <a href="/posts/${post.slug}" onclick="handleNav(event,'/posts/${post.slug}')" class="read-more">Read more →</a>
              </div>
            </div>
          </article>`,
            )
            .join("");

    const postsPageHtml = `<!DOCTYPE html>
<html>
<head>
  ${sharedHead(`${page.title} — ${settings.siteName}`)}
  <style>
    .page-header { background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 3rem 1rem; }
    .page-header-inner { max-width: 1200px; margin: 0 auto; }
    .page-header h1 { font-size: 2rem; font-weight: 800; color: #111827; margin: 0 0 0.5rem; }
    .page-header p { color: #6b7280; margin: 0; }
    .posts-wrapper { flex: 1; width: min(1200px, calc(100% - 2rem)); margin: 3rem auto; padding-bottom: 4rem; }
    .posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr)); gap: 2rem; }
    .post-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; transition: box-shadow 0.2s; display: flex; flex-direction: column; }
    .post-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .post-image { width: 100%; height: 200px; object-fit: cover; display: block; }
    .post-body { padding: 1.25rem; display: flex; flex-direction: column; flex: 1; }
    .post-cats { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .post-cat { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; background: #f3f4f6; padding: 0.2rem 0.6rem; border-radius: 999px; }
    .post-title { font-size: 1.125rem; font-weight: 700; margin: 0 0 0.5rem; line-height: 1.3; }
    .post-title a { color: #111827; text-decoration: none; }
    .post-title a:hover { color: #374151; }
    .post-excerpt { font-size: 0.9rem; color: #6b7280; margin: 0 0 1rem; line-height: 1.6; flex: 1; }
    .post-footer-row { display: flex; align-items: center; justify-content: space-between; }
    .post-date { font-size: 0.8rem; color: #9ca3af; }
    .read-more { font-size: 0.875rem; color: #111827; font-weight: 600; text-decoration: none; }
    .read-more:hover { text-decoration: underline; }
    .empty { text-align: center; padding: 4rem 1rem; color: #6b7280; }
  </style>
</head>
<body>
  ${adminToolbarHtml}
  ${sharedNavbar}
  <header class="page-header">
    <div class="page-header-inner">
      <h1>${page.title}</h1>
      <p>${posts.length} published post${posts.length !== 1 ? "s" : ""}</p>
    </div>
  </header>
  <main class="posts-wrapper">
    <div class="posts-grid">${postsHtml}</div>
  </main>
  ${sharedFooter}
  ${sharedScript}
</body>
</html>`;

    return (
      <iframe
        srcDoc={postsPageHtml}
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

  // ── Regular page ──
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  ${sharedHead(
    seo.metaTitle || page.title,
    `
    <meta name="description" content="${seo.metaDescription || ""}">
    <meta name="robots" content="${(seo.robotsIndex !== false ? "index" : "noindex") + "," + (seo.robotsFollow !== false ? "follow" : "nofollow")}">
    ${
      seo.canonicalUrl
        ? `<link rel="canonical" href="${seo.canonicalUrl}">`
        : `<link rel="canonical" href="${siteUrl}/${page.slug}">`
    }
    <meta property="og:type" content="website">
    <meta property="og:url" content="${siteUrl}/${page.slug}">
    <meta property="og:title" content="${seo.ogTitle || seo.metaTitle || page.title}">
    <meta property="og:description" content="${seo.ogDescription || seo.metaDescription || ""}">
    ${seo.ogImage ? `<meta property="og:image" content="${seo.ogImage}">` : ""}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seo.twitterTitle || seo.ogTitle || page.title}">
    <meta name="twitter:description" content="${seo.twitterDescription || seo.metaDescription || ""}">
    ${seo.twitterImage || seo.ogImage ? `<meta name="twitter:image" content="${seo.twitterImage || seo.ogImage}">` : ""}
    `,
  )}
  <style>
    .cms-page-wrapper { flex: 1; min-height: calc(100vh - 140px); }
    /* ── Page CSS ── */
    ${page.css || ""}
  </style>
</head>
<body>
  ${adminToolbarHtml}
  ${sharedNavbar}
  <main class="cms-page-wrapper">
    ${page.html}
  </main>
  ${sharedFooter}
  <script>
    function handleNav(event, url) {
      event.preventDefault();
      window.parent.postMessage({ type: "NAVIGATE", url: url }, "*");
    }
    ${page.js || ""}
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
