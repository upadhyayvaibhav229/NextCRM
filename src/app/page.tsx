"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useMenusPreview } from "@/src/hooks/useMenusPreview";
import { buildAdminToolbarHtml } from "@/src/lib/admin-toolbar";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string | null;
  publishedAt?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  tags?: { id: string; name: string; slug: string }[];
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

export default function PostsListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { menus, loading: menusLoading } = useMenusPreview();
  const [settings, setSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(
    DEFAULT_FOOTER_SETTINGS,
  );

  const [footerMenus, setFooterMenus] = useState<any[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<any>(null);
  const [globalCss, setGlobalCss] = useState("");
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

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const [settingsRes, footerRes] = await Promise.all([
          fetch("/api/setting"),
          fetch("/api/footer-setting"),
        ]);
        const settingsData = await settingsRes.json();
        const footerData = await footerRes.json();
        const siteSettings = settingsData.data;

        setSettings(siteSettings);
        if (footerData.success) {
          setFooterSettings({
            ...DEFAULT_FOOTER_SETTINGS,
            ...(footerData.data?.footer ?? {}),
          });
        }

        if (
          siteSettings?.homepageType === "page" &&
          siteSettings?.homepagePageId
        ) {
          const res = await fetch(`/api/pages/${siteSettings.homepagePageId}`);

          const data = await res.json();

          if (data.success && data.data) {
            setPage(data.data);
          }
        } else {
          const postsRes = await fetch("/api/posts");
          const postsData = await postsRes.json();

          const published = (postsData.data ?? []).filter(
            (p: any) => p.status === "PUBLISHED",
          );

          setLatestPosts(published);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  // ── Fetch global CSS ──
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

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const res = await fetch("/api/posts");
  //       const data = await res.json();
  //       // filter published only
  //       const published = (data.data ?? []).filter(
  //         (p: any) => p.status === "PUBLISHED",
  //       );
  //       setPosts(published);
  //     } catch {
  //       setPosts([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchPosts();
  // }, []);

  const headerMenu = useMemo(
    () => menus.find((m) => m.location === "header"),
    [menus],
  );
  const footerMenu = useMemo(
    () => menus.find((m) => m.location === "footer"),
    [menus],
  );

  if (loading || menusLoading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading...
      </div>
    );
  }

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
        const children =
          item.children?.length > 0
            ? `<ul class="cms-submenu">${mapItems(item.children, className)}</ul>`
            : "";
        return `<li>
          <a href="${href}" class="${className}" onclick="handleNav(event,'${href}')">${item.label}</a>
          ${children}
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
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const buildToolbar = (pageId?: string | number | null) =>
    settings?.showAdminToolbar && isAdmin
      ? buildAdminToolbarHtml({
          pageId,
          siteName: settings.siteName,
          editUrl: pageId ? undefined : "/admin",
        })
      : "";
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
                      ${link.icon ? `<img src="${link.icon}" class="footer-social-icon" alt="${link.platform}" />` : `<span>${link.platform}</span>`}
                    </a>`,
                )
                .join("")}
            </div>`
          : ""
      }
    </div>`;

  const postsHtml =
    latestPosts.length === 0
      ? `<div class="empty"><p>No posts published yet.</p></div>`
      : latestPosts
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
                ? `<div class="post-cats">${post.categories.map((c) => `<span class="post-cat">${c.name}</span>`).join("")}</div>`
                : ""
            }
            <h2 class="post-title">
              <a href="/posts/${post.slug}" onclick="handleNav(event,'/posts/${post.slug}')">${post.title}</a>
            </h2>
            ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ""}
            <div class="post-footer">
              ${
                post.publishedAt
                  ? `<span class="post-date">${new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>`
                  : ""
              }
              <a href="/posts/${post.slug}" onclick="handleNav(event,'/posts/${post.slug}')" class="read-more">Read more â†’</a>
            </div>
            ${
              post.tags?.length
                ? `<div class="post-tags">${post.tags.map((t) => `<span class="post-tag">#${t.name}</span>`).join("")}</div>`
                : ""
            }
          </div>
        </article>`,
          )
          .join("");

  // â”€â”€â”€ If homepage is set to a static page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (page && settings) {
    const seo = page.seoData || {};
    const pageHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.metaTitle || page.title} â€” ${settings.siteName}</title>
  <meta name="description" content="${seo.metaDescription || ""}">
  <link rel="icon" href="${settings.favicon}" />
  <style>
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;line-height:1.6}
    body{display:flex;flex-direction:column;background:#fff;color:#111827}
    .cms-navbar{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
    .cms-navbar-inner{width:min(1200px,calc(100% - 2rem));margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:1rem 0;gap:1rem}
    .cms-brand{color:#111827;text-decoration:none;font-size:1.25rem;font-weight:700}
    .cms-menu{display:flex;gap:.25rem;list-style:none;margin:0;padding:0;align-items:center}
    .cms-menu>li{position:relative}
    .cms-link{display:block;color:#374151;text-decoration:none;font-weight:500;font-size:.9rem;padding:.5rem .75rem;border-radius:6px;transition:background .15s,color .15s}
    .cms-link:hover{background:#f3f4f6;color:#111827}
    .cms-menu>li:has(.cms-submenu)>.cms-link::after{content:'';display:inline-block;margin-left:6px;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid currentColor;vertical-align:middle;opacity:.6;transition:transform .2s}
    .cms-menu>li:has(.cms-submenu):hover>.cms-link::after{transform:rotate(180deg)}
    .cms-submenu{position:absolute;top:100%;left:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.10);list-style:none;margin:0;padding:.375rem;padding-top:10px;opacity:0;visibility:hidden;transition:opacity .18s,visibility .18s;pointer-events:none;z-index:200}
    .cms-menu>li:hover>.cms-submenu,.cms-submenu li:hover>.cms-submenu{opacity:1;visibility:visible;pointer-events:auto}
    .cms-menu>li::after{content:'';position:absolute;bottom:-10px;left:0;right:0;height:10px;background:transparent}
    .cms-submenu .cms-submenu{top:-.375rem;left:calc(100% + 6px)}
    .cms-submenu li{position:relative}
    .cms-submenu a{display:block;padding:.5rem .875rem;color:#374151;text-decoration:none;font-size:.875rem;border-radius:7px;transition:background .12s}
    .cms-submenu a:hover{background:#f3f4f6;color:#111827}
    .cms-page-wrapper{flex:1;min-height:calc(100vh - 140px)}
    .cms-footer{margin-top:auto;background:#fff;color:#6c757d;border-top:1px solid #e5e7eb}
.cms-footer-inner{width:min(1200px,calc(100% - 2rem));margin:0 auto;padding:3rem 0 1.5rem}
.footer-top{display:grid;grid-template-columns:minmax(180px,1fr) minmax(180px,1fr) minmax(260px,2fr);gap:3rem;margin-bottom:2rem;align-items:start}
.footer-brand{display:flex;flex-direction:column;align-items:flex-start}
.footer-logo{max-width:140px;height:auto;margin-bottom:1rem}
.footer-brand-name{color:#111827;text-decoration:none;font-size:1.125rem;font-weight:700;margin-bottom:0.5rem}
.footer-brand-desc{font-size:.875rem;color:#6c757d;margin:0;line-height:1.5}
.footer-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:2rem;width:100%}
.footer-col-title{color:#111827;font-size:.875rem;font-weight:600;margin:0 0 1rem;text-transform:uppercase;letter-spacing:.05em}
.footer-col-links{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem}
.footer-col-link{color:#6c757d;text-decoration:none;font-size:.875rem;transition:color .15s}
.footer-col-link:hover{color:#111827}
.footer-contact{display:flex;flex-direction:column;align-items:flex-start}
.footer-contact-text{font-size:.875rem;color:#6c757d;margin:0 0 0.5rem;line-height:1.5}
.footer-contact-link{color:#6c757d;text-decoration:none;font-size:.875rem;margin-bottom:1rem;transition:color .15s}
.footer-contact-link:hover{color:#111827}
.footer-social{display:flex;gap:1rem;margin-top:0.5rem}
.footer-social-link{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;transition:opacity .15s}
.footer-social-link:hover{opacity:0.8}
.footer-social-icon{width:20px;height:20px;object-fit:contain}
.footer-bottom{border-top:1px solid #e5e7eb;padding-top:1.5rem;text-align:center;font-size:.75rem;color:#9ca3af}border:1px solid #374151;display:inline-flex;align-items:center;justify-content:center;color:#d1d5db;text-decoration:none;overflow:hidden;transition:background .15s,border-color .15s,transform .15s}
    .footer-social-link:hover{background:#374151;border-color:#4b5563;transform:translateY(-1px)}
    .footer-social-icon{width:20px;height:20px;object-fit:contain}
    .footer-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:2rem}
    .footer-col-title{color:#fff;font-size:.875rem;font-weight:600;margin:0 0 1rem;text-transform:uppercase;letter-spacing:.05em}
    .footer-col-links{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem}
    .footer-col-link{color:#6b7280;text-decoration:none;font-size:.875rem;transition:color .15s}
    .footer-col-link:hover{color:#fff}
    .footer-bottom{border-top:1px solid #1f2937;padding-top:1.5rem;text-align:center;font-size:.8rem;color:#4b5563}
@media (max-width: 900px){.footer-top{grid-template-columns:1fr}.footer-cols{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}
    @media (max-width: 900px){.footer-top{grid-template-columns:1fr}.footer-cols{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}
    ${page.css ?? ""}
    /* ── Global CSS ── */
    ${globalCss || ""}
  </style>
</head>
<body>
  ${buildToolbar(page.id)}
  <nav class="cms-navbar">
    <div class="cms-navbar-inner">
      <a href="/" class="cms-brand" onclick="handleNav(event,'/')">
        ${settings.logo ? `<img src="${settings.logo}" alt="${settings.siteName}" style="height:40px;object-fit:contain;" />` : settings.siteName}
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
</footer>
  <script>
    function handleNav(e, url) {
      e.preventDefault();
      window.parent.postMessage({ type: "NAVIGATE", url }, "*");
    }
    ${page.js ?? ""}
  </script>
</body>
</html>`;

    return (
      <iframe
        srcDoc={pageHtml}
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

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="icon" href="${settings.favicon}?v=${Date.now()}" />
  <meta name="description" content="All published posts">
<title>Posts â€” ${settings.siteName}</title>
  <style>
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;line-height:1.6}
    body{display:flex;flex-direction:column;background:#fff;color:#111827}
    .cms-navbar{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
    .cms-navbar-inner,
    .cms-footer-inner{width:min(1200px,calc(100% - 2rem));margin:0 auto}
    .cms-navbar-inner{display:flex;align-items:center;justify-content:space-between;padding:1rem 0;gap:1rem}
    .cms-brand{color:#111827;text-decoration:none;font-size:1.25rem;font-weight:700}
    .cms-menu{display:flex;gap:.25rem;list-style:none;margin:0;padding:0;align-items:center}
    .cms-menu>li{position:relative}
    .cms-link{display:block;color:#374151;text-decoration:none;font-weight:500;font-size:.9rem;padding:.5rem .75rem;border-radius:6px;transition:background .15s,color .15s;white-space:nowrap}
    .cms-link:hover{background:#f3f4f6;color:#111827}
    .cms-menu>li:has(.cms-submenu)>.cms-link::after{content:'';display:inline-block;margin-left:6px;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid currentColor;vertical-align:middle;opacity:.6;transition:transform .2s}
    .cms-menu>li:has(.cms-submenu):hover>.cms-link::after{transform:rotate(180deg)}
    .cms-submenu{position:absolute;top:100%;left:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.10);list-style:none;margin:0;padding:.375rem;padding-top:10px;opacity:0;visibility:hidden;transition:opacity .18s,visibility .18s;pointer-events:none;z-index:200}
    .cms-menu>li:hover>.cms-submenu,.cms-submenu li:hover>.cms-submenu{opacity:1;visibility:visible;pointer-events:auto}
    .cms-menu>li::after{content:'';position:absolute;bottom:-10px;left:0;right:0;height:10px;background:transparent}
    .cms-submenu .cms-submenu{top:-.375rem;left:calc(100% + 6px)}
    .cms-submenu li{position:relative}
    .cms-submenu a{display:block;padding:.5rem .875rem;color:#374151;text-decoration:none;font-size:.875rem;border-radius:7px;transition:background .12s}
    .cms-submenu a:hover{background:#f3f4f6;color:#111827}
    .page-header{background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:3rem 1rem}
    .page-header-inner{max-width:1200px;margin:0 auto}
    .page-header h1{font-size:2rem;font-weight:800;color:#111827;margin:0 0 .5rem;letter-spacing:-.02em}
    .page-header p{color:#6b7280;margin:0}
    .posts-wrapper{flex:1;width:min(1200px,calc(100% - 2rem));margin:3rem auto;padding-bottom:4rem}
    .posts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:2rem}
    .post-card{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;transition:box-shadow .2s;display:flex;flex-direction:column}
    .post-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.08)}
    .post-image{width:100%;height:200px;object-fit:cover;display:block}
    .post-body{padding:1.25rem;display:flex;flex-direction:column;flex:1}
    .post-cats{display:flex;gap:.5rem;margin-bottom:.75rem;flex-wrap:wrap}
    .post-cat{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;background:#f3f4f6;padding:.2rem .6rem;border-radius:999px}
    .post-title{font-size:1.125rem;font-weight:700;margin:0 0 .5rem;line-height:1.3}
    .post-title a{color:#111827;text-decoration:none}
    .post-title a:hover{color:#374151}
    .post-excerpt{font-size:.9rem;color:#6b7280;margin:0 0 1rem;line-height:1.6;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .post-footer{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem}
    .post-date{font-size:.8rem;color:#9ca3af}
    .read-more{font-size:.875rem;color:#111827;font-weight:600;text-decoration:none}
    .read-more:hover{text-decoration:underline}
    .post-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.5rem}
    .post-tag{font-size:.75rem;color:#9ca3af}
    .empty{text-align:center;padding:4rem 1rem;color:#6b7280}
    .cms-footer{margin-top:auto;background:#fff;color:#6c757d;border-top:1px solid #e5e7eb}
    .cms-footer-inner{width:min(1200px,calc(100% - 2rem));margin:0 auto;padding:3rem 0 1.5rem}
    .footer-top{display:grid;grid-template-columns:minmax(180px,1fr) minmax(180px,1fr) minmax(260px,2fr);gap:3rem;margin-bottom:2rem;align-items:start}
    .footer-brand{display:flex;flex-direction:column;align-items:flex-start}
    .footer-logo{max-width:140px;height:auto;margin-bottom:1rem}
    .footer-brand-name{color:#111827;text-decoration:none;font-size:1.125rem;font-weight:700;margin-bottom:0.5rem}
    .footer-brand-desc{font-size:.875rem;color:#6c757d;margin:0;line-height:1.5}
    .footer-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:2rem;width:100%}
    .footer-col-title{color:#111827;font-size:.875rem;font-weight:600;margin:0 0 1rem;text-transform:uppercase;letter-spacing:.05em}
    .footer-col-links{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem}
    .footer-col-link{color:#6c757d;text-decoration:none;font-size:.875rem;transition:color .15s}
    .footer-col-link:hover{color:#111827}
    .footer-contact{display:flex;flex-direction:column;align-items:flex-start}
    .footer-contact-text{font-size:.875rem;color:#6c757d;margin:0 0 0.5rem;line-height:1.5}
    .footer-contact-link{color:#6c757d;text-decoration:none;font-size:.875rem;margin-bottom:1rem;transition:color .15s}
    .footer-contact-link:hover{color:#111827}
    .footer-social{display:flex;gap:1rem;margin-top:0.5rem}
    .footer-social-link{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;transition:opacity .15s}
    .footer-social-link:hover{opacity:0.8}
    .footer-social-icon{width:20px;height:20px;object-fit:contain}
    .footer-bottom{border-top:1px solid #e5e7eb;padding-top:1.5rem;text-align:center;font-size:.75rem;color:#9ca3af}
    @media (max-width: 900px){.footer-top{grid-template-columns:1fr}.footer-cols{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}
    @media (max-width: 900px){.footer-top{grid-template-columns:1fr}.footer-cols{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}
  /* ── Global CSS ── */
  ${globalCss || ""}
  </style>
</head>
<body>
  ${buildToolbar(null)}
  <nav class="cms-navbar">
    <div class="cms-navbar-inner">
   <a href="/" class="cms-brand" onclick="handleNav(event,'/')">
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
  </nav>

  <header class="page-header">
    <div class="page-header-inner">
      <h1>Posts</h1>
      <p>${latestPosts.length} published post${latestPosts.length !== 1 ? "s" : ""}</p>
    </div>
  </header>

  <main class="posts-wrapper">
    <div class="posts-grid">
      ${postsHtml}
    </div>
  </main>

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
</footer>
  <script>
    function handleNav(e, url) {
      e.preventDefault();
      window.parent.postMessage({ type: "NAVIGATE", url }, "*");
    }
  </script>
</body>
</html>`;

  return (
    <iframe
      srcDoc={fullHtml}
      title="Posts"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}
