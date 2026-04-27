"use client";

import Link from "next/link";

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

interface NavbarProps {
  menu: MenuData | null;
  siteName?: string;
}

export function Navbar({ menu, siteName = "My Website" }: NavbarProps) {
  if (!menu || menu.items.length === 0) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link href="/" className="navbar-brand">
            {siteName}
          </Link>
        </div>
        <style jsx>{`
          .navbar {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            padding: 1rem 2rem;
          }
          .navbar-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .navbar-brand {
            font-weight: 700;
            font-size: 1.25rem;
            color: #111827;
            text-decoration: none;
          }
        `}</style>
      </nav>
    );
  }

  function buildTree(items: any[]) {
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
  }

  function renderMenuItems(items: any[]) {
    return items.map((item) => {
      const href =
        item.type === "page" && item.slug
          ? `/${item.slug}`
          : item.url || "#";

      return (
        <li key={item.id} className="navbar-item">
          <Link href={href} className="navbar-link">
            {item.label}
          </Link>

          {item.children?.length > 0 && (
            <ul className="submenu">{renderMenuItems(item.children)}</ul>
          )}
        </li>
      );
    });
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-brand">
          {siteName}
        </Link>
        <ul className="navbar-menu">
          {renderMenuItems(buildTree(menu.items))}
        </ul>
      </div>
      <style jsx>{`
        .navbar {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 2rem;
        }
        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .submenu {
          list-style: none;
          margin: 0.5rem 0 0 1rem;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .navbar-brand {
          font-weight: 700;
          font-size: 1.25rem;
          color: #111827;
          text-decoration: none;
        }
        .navbar-menu {
          display: flex;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .navbar-item {
          margin: 0;
        }
        .navbar-link {
          color: #4b5563;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .navbar-link:hover {
          color: #111827;
        }
      `}</style>
    </nav>
  );
}

// Footer component for footer menu location
export function Footer({ menu }: { menu: MenuData | null }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {menu && menu.items.length > 0 && (
          <ul className="footer-menu">
            {menu.items.map((item) => {
              const href =
                item.type === "page" && item.slug
                  ? `/${item.slug}`
                  : item.url || "#";

              return (
                <li key={item.id} className="footer-item">
                  <Link href={href} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <p className="footer-copyright">
          © {currentYear} My Website. All rights reserved.
        </p>
      </div>
      <style jsx>{`
        .footer {
          background: #111827;
          color: #9ca3af;
          padding: 2rem;
          margin-top: auto;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .footer-menu {
          display: flex;
          gap: 2rem;
          justify-content: center;
          list-style: none;
          margin: 0 0 1rem 0;
          padding: 0;
        }
        .footer-item {
          margin: 0;
        }
        .footer-link {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #ffffff;
        }
        .footer-copyright {
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </footer>
  );
}
