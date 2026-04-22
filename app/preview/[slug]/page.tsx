"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Page {
  id: string
  title: string
  slug: string
  status: "published" | "draft"
  modified: string
  html: string
  css: string
  js: string
}

interface MenuItem {
  id: string
  label: string
  type: "page" | "custom"
  pageId?: string
  slug?: string
  url?: string
  children: MenuItem[]
}

interface MenuData {
  id: string
  name: string
  location: "primary" | "footer" | "none"
  items: MenuItem[]
}

// Fallback menus (matching the admin panel initial data)
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
      { id: "f1", label: "Privacy Policy", type: "custom", url: "/privacy", children: [] },
      { id: "f2", label: "Terms of Service", type: "custom", url: "/terms", children: [] },
    ],
  },
]

// Sample pages data (matching the admin panel)
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
  background: white;
  color: #667eea;
  padding: 1rem 2rem;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.features {
  display: flex;
  gap: 2rem;
  padding: 4rem 2rem;
  justify-content: center;
}

.feature {
  text-align: center;
  padding: 2rem;
  background: #f5f5f5;
}`,
    js: `document.querySelector('.cta')?.addEventListener('click', () => {
  alert('Welcome aboard!');
});`,
  },
  {
    id: "2",
    title: "About Us",
    slug: "about",
    status: "published",
    modified: "2024-01-14",
    html: `<div class="about-container">
  <h1>About Our Company</h1>
  <p class="intro">We are a team of passionate developers building the future of web.</p>
  
  <div class="team">
    <div class="member">
      <div class="avatar">JD</div>
      <h4>John Doe</h4>
      <p>Founder & CEO</p>
    </div>
    <div class="member">
      <div class="avatar">JS</div>
      <h4>Jane Smith</h4>
      <p>CTO</p>
    </div>
  </div>
</div>`,
    css: `.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.about-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.intro {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
}

.team {
  display: flex;
  gap: 2rem;
}

.member {
  text-align: center;
  padding: 2rem;
  background: #f9f9f9;
  flex: 1;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}`,
    js: `console.log('About page loaded');`,
  },
  {
    id: "3",
    title: "Services",
    slug: "services",
    status: "draft",
    modified: "2024-01-13",
    html: `<div class="services-page">
  <h1>Our Services</h1>
  
  <div class="service-grid">
    <div class="service-card">
      <span class="icon">🚀</span>
      <h3>Web Development</h3>
      <p>Custom websites and web applications</p>
      <span class="price">From $5,000</span>
    </div>
    <div class="service-card">
      <span class="icon">📱</span>
      <h3>Mobile Apps</h3>
      <p>iOS and Android applications</p>
      <span class="price">From $10,000</span>
    </div>
    <div class="service-card">
      <span class="icon">☁️</span>
      <h3>Cloud Solutions</h3>
      <p>Scalable cloud infrastructure</p>
      <span class="price">Custom Quote</span>
    </div>
  </div>
</div>`,
    css: `.services-page {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.services-page h1 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.service-card {
  background: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.price {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}`,
    js: `document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('click', () => {
    card.style.background = '#f0f0ff';
  });
});`,
  },
  {
    id: "4",
    title: "Contact",
    slug: "contact",
    status: "published",
    modified: "2024-01-12",
    html: `<div class="contact-page">
  <h1>Get In Touch</h1>
  
  <form class="contact-form">
    <div class="form-group">
      <label>Name</label>
      <input type="text" placeholder="Your name" />
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" placeholder="your@email.com" />
    </div>
    <div class="form-group">
      <label>Message</label>
      <textarea placeholder="Your message..."></textarea>
    </div>
    <button type="submit">Send Message</button>
  </form>
</div>`,
    css: `.contact-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.contact-page h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.contact-form {
  background: #f9f9f9;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 150px;
  resize: vertical;
}

button[type="submit"] {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}

button[type="submit"]:hover {
  background: #5a67d8;
}`,
    js: `document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Message sent! We will get back to you soon.');
});`,
  },
]

export default function PreviewPage() {
  const params = useParams()
  const slug = params.slug as string
  const [page, setPage] = useState<Page | null>(null)
  const [headerMenu, setHeaderMenu] = useState<MenuData | null>(null)
  const [footerMenu, setFooterMenu] = useState<MenuData | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Get pages from localStorage
    const storedPages = localStorage.getItem("cms_pages")
    let loadedPages: Page[] = samplePages

    if (storedPages) {
      try {
        loadedPages = JSON.parse(storedPages)
      } catch {
        loadedPages = samplePages
      }
    }
    setPages(loadedPages)

    const foundPage = loadedPages.find((p) => p.slug === slug)
    if (foundPage) {
      setPage(foundPage)
    } else {
      setNotFound(true)
    }

    // Get menus from localStorage (or use fallback)
    const storedMenus = localStorage.getItem("cms_menus")
    let menus: MenuData[] = fallbackMenus
    
    if (storedMenus) {
      try {
        menus = JSON.parse(storedMenus)
      } catch {
        menus = fallbackMenus
      }
    }
    
    // Enrich menu items with page slugs
    const enrichedMenus = menus.map((menu) => ({
      ...menu,
      items: menu.items.map((item) => {
        if (item.type === "page" && item.pageId) {
          const linkedPage = loadedPages.find((p) => p.id === item.pageId)
          return {
            ...item,
            slug: linkedPage?.slug || "",
          }
        }
        return item
      }),
    }))

    const header = enrichedMenus.find((m) => m.location === "primary")
    const footer = enrichedMenus.find((m) => m.location === "footer")
    
    if (header) setHeaderMenu(header)
    if (footer) setFooterMenu(footer)
  }, [slug])

  if (notFound) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f5f5f5",
        }}
      >
        <h1 style={{ fontSize: "4rem", color: "#333", margin: 0 }}>404</h1>
        <p style={{ color: "#666", fontSize: "1.2rem" }}>Page not found: /{slug}</p>
      </div>
    )
  }

  if (!page) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        Loading...
      </div>
    )
  }

  // Build navbar HTML
  const buildNavbarHtml = () => {
    if (!headerMenu || headerMenu.items.length === 0) {
      return `
        <nav class="cms-navbar">
          <div class="cms-navbar-container">
            <a href="/preview/home" class="cms-navbar-brand">My Website</a>
          </div>
        </nav>
      `
    }

    const menuItems = headerMenu.items
      .map((item) => {
        const href = item.type === "page" && item.slug
          ? `/preview/${item.slug}`
          : item.url || "#"
        return `<li class="cms-navbar-item"><a href="${href}" class="cms-navbar-link">${item.label}</a></li>`
      })
      .join("")

    return `
      <nav class="cms-navbar">
        <div class="cms-navbar-container">
          <a href="/preview/home" class="cms-navbar-brand">My Website</a>
          <ul class="cms-navbar-menu">${menuItems}</ul>
        </div>
      </nav>
    `
  }

  // Build footer HTML
  const buildFooterHtml = () => {
    const currentYear = new Date().getFullYear()
    
    if (!footerMenu || footerMenu.items.length === 0) {
      return `
        <footer class="cms-footer">
          <div class="cms-footer-container">
            <p class="cms-footer-copyright">&copy; ${currentYear} My Website. All rights reserved.</p>
          </div>
        </footer>
      `
    }

    const menuItems = footerMenu.items
      .map((item) => {
        const href = item.type === "page" && item.slug
          ? `/preview/${item.slug}`
          : item.url || "#"
        return `<li class="cms-footer-item"><a href="${href}" class="cms-footer-link">${item.label}</a></li>`
      })
      .join("")

    return `
      <footer class="cms-footer">
        <div class="cms-footer-container">
          <ul class="cms-footer-menu">${menuItems}</ul>
          <p class="cms-footer-copyright">&copy; ${currentYear} My Website. All rights reserved.</p>
        </div>
      </footer>
    `
  }

  // Navbar and footer styles
  const layoutStyles = `
    .cms-navbar {
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .cms-navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cms-navbar-brand {
      font-weight: 700;
      font-size: 1.25rem;
      color: #111827;
      text-decoration: none;
    }
    .cms-navbar-menu {
      display: flex;
      gap: 2rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .cms-navbar-item {
      margin: 0;
    }
    .cms-navbar-link {
      color: #4b5563;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .cms-navbar-link:hover {
      color: #111827;
    }
    
    .cms-footer {
      background: #111827;
      color: #9ca3af;
      padding: 2rem;
      margin-top: auto;
    }
    .cms-footer-container {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }
    .cms-footer-menu {
      display: flex;
      gap: 2rem;
      justify-content: center;
      list-style: none;
      margin: 0 0 1rem 0;
      padding: 0;
    }
    .cms-footer-item {
      margin: 0;
    }
    .cms-footer-link {
      color: #9ca3af;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    .cms-footer-link:hover {
      color: #ffffff;
    }
    .cms-footer-copyright {
      font-size: 0.875rem;
      margin: 0;
    }
    
    .cms-page-wrapper {
      min-height: calc(100vh - 140px);
    }
  `

  // Build the complete HTML document
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} - My Website</title>
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      min-height: 100vh;
    }
    body {
      display: flex;
      flex-direction: column;
    }
    ${layoutStyles}
    ${page.css}
  </style>
</head>
<body>
${buildNavbarHtml()}
<main class="cms-page-wrapper">
${page.html}
</main>
${buildFooterHtml()}
<script>
${page.js}
</script>
</body>
</html>`

  // Use iframe with srcdoc to render raw HTML without any React wrapper
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
  )
}
