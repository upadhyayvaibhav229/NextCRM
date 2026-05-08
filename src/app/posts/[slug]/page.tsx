"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMenusPreview } from "@/src/hooks/useMenusPreview";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string | null;
  publishedAt?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  tags?: { id: string; name: string; slug: string }[];
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

export default function PublicPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const { menus, loading: menusLoading } = useMenusPreview();

  const [footerMenus, setFooterMenus] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(
    DEFAULT_FOOTER_SETTINGS,
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [res, footerRes] = await Promise.all([
          fetch("/api/setting"),
          fetch("/api/footer-setting"),
        ]);
        const data = await res.json();
        const footerData = await footerRes.json();

        if (data.success) {
          setSettings(data.data);
        }
        if (footerData.success) {
          setFooterSettings({
            ...DEFAULT_FOOTER_SETTINGS,
            ...(footerData.data?.footer ?? {}),
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };

    fetchSettings();
  }, []);
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

  // Handle navigation from iframe
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

  // Fetch post by slug
  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/slug/${slug}`);
        const data = await res.json();
        if (data.success && data.data) {
          setPost(data.data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

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

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="mt-3 text-lg text-gray-600">
            Post not found: /posts/{slug}
          </p>
          <a
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            â† Back to home
          </a>
        </div>
      </div>
    );
  }

  if (!post) return null;

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

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const categoriesHtml = post.categories?.length
    ? `<div class="post-cats">
        ${post.categories.map((c) => `<a href="/posts?category=${c.slug}" class="post-cat" onclick="handleNav(event,'/posts?category=${c.slug}')">${c.name}</a>`).join("")}
       </div>`
    : "";

  const tagsHtml = post.tags?.length
    ? `<div class="post-tags">
        ${post.tags.map((t) => `<a href="/posts?tag=${t.slug}" class="post-tag" onclick="handleNav(event,'/posts?tag=${t.slug}')">#${t.name}</a>`).join("")}
       </div>`
    : "";

  const featuredImageHtml = post.featuredImage
    ? `<div class="post-featured-image">
        <img src="${post.featuredImage}" alt="${post.title}" />
       </div>`
    : "";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const seo = (post as any).seoData || {};
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${seo.metaTitle || post.title}</title>
<meta name="description" content="${seo.metaDescription || post.excerpt || ""}">

<meta name="robots" content="${
    (seo.robotsIndex !== false ? "index" : "noindex") +
    "," +
    (seo.robotsFollow !== false ? "follow" : "nofollow")
  }">

${
  seo.canonicalUrl
    ? `<link rel="canonical" href="${seo.canonicalUrl}">`
    : `<link rel="canonical" href="${siteUrl}/posts/${post.slug}">`
}

<meta property="og:type" content="article">
<meta property="og:url" content="${siteUrl}/posts/${post.slug}">
<meta property="og:title" content="${seo.ogTitle || seo.metaTitle || post.title}">
<meta property="og:description" content="${seo.ogDescription || seo.metaDescription || post.excerpt || ""}">
${seo.ogImage || post.featuredImage ? `<meta property="og:image" content="${seo.ogImage || post.featuredImage}">` : ""}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seo.twitterTitle || seo.ogTitle || post.title}">
<meta name="twitter:description" content="${seo.twitterDescription || seo.metaDescription || post.excerpt || ""}">
${seo.twitterImage || seo.ogImage || post.featuredImage ? `<meta name="twitter:image" content="${seo.twitterImage || seo.ogImage || post.featuredImage}">` : ""}  
<style>
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;line-height:1.6}
    body{display:flex;flex-direction:column;background:#fff;color:#111827}

    /* â”€â”€ Navbar â”€â”€ */
    .cms-navbar{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
    .cms-navbar-inner,.cms-footer-inner{width:min(1200px,calc(100% - 2rem));margin:0 auto}
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

    /* â”€â”€ Post Layout â”€â”€ */
    .post-wrapper{flex:1;width:min(740px,calc(100% - 2rem));margin:3rem auto;padding-bottom:4rem}

    /* â”€â”€ Categories above title â”€â”€ */
    .post-cats{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}
    .post-cat{display:inline-block;padding:.25rem .75rem;background:#f3f4f6;color:#374151;text-decoration:none;font-size:.75rem;font-weight:600;border-radius:999px;text-transform:uppercase;letter-spacing:.05em;transition:background .15s}
    .post-cat:hover{background:#e5e7eb}

    /* â”€â”€ Title â”€â”€ */
    .post-title{font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;color:#111827;line-height:1.2;margin:0 0 1rem;letter-spacing:-.02em}

    /* â”€â”€ Meta â”€â”€ */
    .post-meta{display:flex;align-items:center;gap:1rem;color:#6b7280;font-size:.875rem;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #e5e7eb}

    /* â”€â”€ Featured image â”€â”€ */
    .post-featured-image{margin-bottom:2rem;border-radius:12px;overflow:hidden}
    .post-featured-image img{width:100%;height:auto;display:block;max-height:480px;object-fit:cover}

    /* â”€â”€ Content â”€â”€ */
    .post-content{font-size:1.0625rem;line-height:1.8;color:#1f2937}
    .post-content h1,.post-content h2,.post-content h3,.post-content h4{font-weight:700;color:#111827;margin:2rem 0 .75rem;line-height:1.3}
    .post-content h1{font-size:1.875rem}
    .post-content h2{font-size:1.5rem}
    .post-content h3{font-size:1.25rem}
    .post-content p{margin:0 0 1.25rem}
    .post-content a{color:#2563eb;text-decoration:underline}
    .post-content img{max-width:100%;height:auto;border-radius:8px;margin:1.5rem 0}
    .post-content blockquote{border-left:4px solid #e5e7eb;padding:.75rem 1.25rem;color:#6b7280;font-style:italic;margin:1.5rem 0;background:#f9fafb;border-radius:0 8px 8px 0}
    .post-content ul,.post-content ol{padding-left:1.5rem;margin:0 0 1.25rem}
    .post-content li{margin-bottom:.375rem}
    .post-content pre{background:#1f2937;color:#f9fafb;padding:1.25rem;border-radius:8px;overflow-x:auto;font-size:.875rem;margin:1.5rem 0}
    .post-content code{background:#f3f4f6;padding:.125rem .375rem;border-radius:4px;font-size:.875em}
    .post-content pre code{background:none;padding:0}
    .post-content hr{border:none;border-top:1px solid #e5e7eb;margin:2rem 0}

    /* â”€â”€ Tags â”€â”€ */
    .post-tags{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid #e5e7eb}
    .post-tag{display:inline-block;padding:.25rem .75rem;background:#f3f4f6;color:#6b7280;text-decoration:none;font-size:.8rem;border-radius:999px;transition:background .15s,color .15s}
    .post-tag:hover{background:#e5e7eb;color:#111827}

    /* Footer */
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
@media (max-width: 900px){.footer-top{grid-template-columns:1fr;gap:2rem}.footer-cols{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}

@media (max-width: 900px){.footer-top{grid-template-columns:1fr}.footer-cols{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}

  </style>
</head>
<body>
  <nav class="cms-navbar">
    <div class="cms-navbar-inner">
<a href="/" class="cms-brand" onclick="handleNav(event,'/')">
  ${settings.logo ? `<img src="${settings.logo}" alt="${settings.siteName}" style="height:40px;object-fit:contain;" />` : settings.siteName}
</a>      <ul class="cms-menu">
        ${headerMenu ? mapItems(buildTree(headerMenu.items), "cms-link") : ""}
      </ul>
    </div>
  </nav>

  <main class="post-wrapper">
    ${categoriesHtml}
    <h1 class="post-title">${post.title}</h1>
    ${publishedDate ? `<div class="post-meta"><span>${publishedDate}</span></div>` : ""}
    ${featuredImageHtml}
    <div class="post-content">${post.content}</div>
    ${tagsHtml}
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
      title={post.title}
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        display: "block",
      }}
    />
  );
}
