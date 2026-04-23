"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

interface MenuItem {
  id: string;
  label: string;
  type: "page" | "custom";
  pageId?: string;
  slug?: string;
  url?: string;
  children: MenuItem[];
}

interface MenuData {
  id: string;
  name: string;
  location: "primary" | "footer" | "none";
  items: MenuItem[];
}

const fallbackMenus: MenuData[] = [
  {
    id: "1",
    name: "Primary Navigation",
    location: "primary",
    items: [
      { id: "m1", label: "Home", type: "page", pageId: "1", children: [] },
      { id: "m2", label: "About", type: "page", pageId: "2", children: [] },
      { id: "m3", label: "Services", type: "page", pageId: "3", children: [] },
      { id: "m4", label: "Contact", type: "page", pageId: "4", children: [] },
    ],
  },
  {
    id: "2",
    name: "Footer Links",
    location: "footer",
    items: [
      {
        id: "f1",
        label: "Privacy Policy",
        type: "custom",
        url: "/privacy",
        children: [],
      },
      {
        id: "f2",
        label: "Terms of Service",
        type: "custom",
        url: "/terms",
        children: [],
      },
    ],
  },
];

const samplePages: Page[] = [
  {
    id: "1",
    title: "Home",
    slug: "home",
    status: "published",
    modified: "2024-01-15",
    html: `<section class="hero">
  <h1>Welcome to Our Platform</h1>
  <p>Build amazing things with modern tools</p>
  <button class="cta">Get Started</button>
</section>

<section class="features">
  <div class="feature">
    <h3>Fast</h3>
    <p>Lightning quick performance</p>
  </div>
  <div class="feature">
    <h3>Secure</h3>
    <p>Enterprise-grade security</p>
  </div>
</section>`,
    css: `.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.cta {
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 9999px;
  font-weight: 700;
  cursor: pointer;
}
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 3rem 2rem;
}
.feature {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: white;
}`,
    js: `document.querySelector(".cta")?.addEventListener("click", () => {
  alert("Welcome aboard!");
});`,
  },
  {
    id: "2",
    title: "About",
    slug: "about",
    status: "published",
    modified: "2024-01-15",
    html: `<section class="page">
  <h1>About Us</h1>
  <p>We build modern digital experiences for ambitious teams.</p>
</section>`,
    css: `.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 4rem 2rem;
}`,
    js: "",
  },
  {
    id: "3",
    title: "Services",
    slug: "services",
    status: "published",
    modified: "2024-01-15",
    html: `<section class="page">
  <h1>Services</h1>
  <p>Strategy, design, development, and launch support.</p>
</section>`,
    css: `.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 4rem 2rem;
}`,
    js: "",
  },
  {
    id: "4",
    title: "Contact",
    slug: "contact",
    status: "published",
    modified: "2024-01-15",
    html: `<section class="page">
  <h1>Contact</h1>
  <form class="contact-form">
    <input type="text" placeholder="Your name" required />
    <input type="email" placeholder="Your email" required />
    <textarea placeholder="Your message" rows="5" required></textarea>
    <button type="submit">Send Message</button>
  </form>
</section>`,
    css: `.page {
  max-width: 760px;
  margin: 0 auto;
  padding: 4rem 2rem;
}
.contact-form {
  display: grid;
  gap: 1rem;
}
.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
}
.contact-form button {
  width: 100%;
  padding: 1rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
}`,
    js: `document.querySelector(".contact-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Message sent!");
});`,
  },
];

export default function PreviewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const [page, setPage] = useState<Page | null>(null);
  const [menus, setMenus] = useState<MenuData[]>(fallbackMenus);
  const [globalCss, setGlobalCss] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NAVIGATE" && typeof event.data.url === "string") {
        router.push(event.data.url);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  useEffect(() => {
    const storedPages = localStorage.getItem("cms_pages");
    const storedMenus = localStorage.getItem("cms_menus");
    const storedGlobalCss = localStorage.getItem("cms_global_css");

    let loadedPages = samplePages;
    let loadedMenus = fallbackMenus;

    if (storedPages) {
      try {
        loadedPages = JSON.parse(storedPages) as Page[];
      } catch {}
    }

    if (storedMenus) {
      try {
        loadedMenus = JSON.parse(storedMenus) as MenuData[];
      } catch {}
    }

    setGlobalCss(storedGlobalCss ?? "");

    const foundPage = loadedPages.find((item) => item.slug === slug) ?? null;
    setPage(foundPage);
    setNotFound(!foundPage);

    const enrichedMenus = loadedMenus.map((menu) => ({
      ...menu,
      items: menu.items.map((item) => {
        if (item.type !== "page" || !item.pageId) {
          return item;
        }

        const linkedPage = loadedPages.find((candidate) => candidate.id === item.pageId);
        return {
          ...item,
          slug: linkedPage?.slug ?? "",
        };
      }),
    }));

    setMenus(enrichedMenus);
  }, [slug]);

  const headerMenu = useMemo(
    () => menus.find((menu) => menu.location === "primary") ?? null,
    [menus],
  );
  const footerMenu = useMemo(
    () => menus.find((menu) => menu.location === "footer") ?? null,
    [menus],
  );

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

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading...
      </div>
    );
  }

  const mapItems = (items: MenuItem[], className: string) =>
    items
      .map((item) => {
        const href =
          item.type === "page" && item.slug ? `/preview/${item.slug}` : item.url || "#";

        return `<li><a href="${href}" class="${className}" onclick="handleNav(event, '${href}')">${item.label}</a></li>`;
      })
      .join("");

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
