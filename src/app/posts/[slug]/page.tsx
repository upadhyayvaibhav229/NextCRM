"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useMenusPreview } from "@/src/hooks/useMenusPreview";
import { buildAdminToolbarHtml } from "@/src/lib/admin-toolbar";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorUrl?: string;
  parentId?: string | null;
  createdAt: string;
  replies?: Comment[];
}

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

// ── Helpers ──────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
];
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function renderCommentTree(
  comments: Comment[],
  postId: string,
  depth = 0,
): string {
  return comments
    .map((c) => {
      const initials = getInitials(c.authorName);
      const color = avatarColor(c.authorName);
      const time = timeAgo(c.createdAt);
      const nameHtml = c.authorUrl
        ? `<a href="${c.authorUrl}" target="_blank" rel="noopener noreferrer nofollow" class="comment-author-link">${c.authorName}</a>`
        : `<span class="comment-author-name">${c.authorName}</span>`;

      const repliesHtml =
        c.replies && c.replies.length > 0
          ? `<div class="comment-replies">${renderCommentTree(c.replies, postId, depth + 1)}</div>`
          : "";

      const replyBtn =
        depth < 3
          ? `<button class="comment-reply-btn" onclick="openReplyForm('${c.id}','${c.authorName.replace(/'/g, "\\'")}')">↩ Reply</button>`
          : "";

      return `
        <div class="comment-item" id="comment-${c.id}">
          <div class="comment-avatar" style="background:${color}">${initials}</div>
          <div class="comment-body">
            <div class="comment-meta">
              ${nameHtml}
              <span class="comment-time">${time}</span>
            </div>
            <p class="comment-text">${c.content}</p>
            <div class="comment-actions">
              ${replyBtn}
            </div>
            <div class="reply-form-container" id="reply-form-${c.id}" style="display:none"></div>
            ${repliesHtml}
          </div>
        </div>`;
    })
    .join("");
}

function buildCommentFormHtml(
  postId: string,
  parentId = "",
  parentAuthor = "",
): string {
  const replyNotice = parentAuthor
    ? `<div class="reply-notice">Replying to <strong>${parentAuthor}</strong></div>`
    : "";

  // Use a unique suffix — "root" for main form, parentId for replies
  const suffix = parentId || "root";

  return `
    <div class="comment-form-wrap" data-post-id="${postId}" data-parent-id="${parentId}">
      ${replyNotice}
      <div class="form-row">
        <div class="form-group">
          <label>Name <span class="required">*</span></label>
          <input type="text" id="cf-name-${suffix}" placeholder="Your name" />
        </div>
        <div class="form-group">
          <label>Email <span class="required">*</span></label>
          <input type="email" id="cf-email-${suffix}" placeholder="your@email.com" />
        </div>
      </div>
      <div class="form-group">
        <label>Website</label>
        <input type="url" id="cf-url-${suffix}" placeholder="https://" />
      </div>
      <div class="form-group">
        <label>Comment <span class="required">*</span></label>
        <textarea id="cf-content-${suffix}" rows="5" placeholder="Write your comment..."></textarea>
      </div>
      <div id="cf-status-${suffix}" class="cf-status" style="display:none"></div>
      <div class="form-actions">
        ${parentId ? `<button class="btn-cancel" onclick="cancelReply('${parentId}')">Cancel</button>` : ""}
        <button type="button" class="btn-submit" onclick="submitComment('${postId}','${parentId}','${suffix}')">
          ${parentId ? "Post Reply" : "Post Comment"}
        </button>
      </div>
    </div>`;
}
// ── Component ─────────────────────────────────────────────

export default function PublicPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [footerMenus, setFooterMenus] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [globalCss, setGlobalCss] = useState("");

  const { menus, loading: menusLoading } = useMenusPreview();

  // ── Fetch settings ──
  useEffect(() => {
    fetch("/api/setting")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      })
      .catch(console.error);
  }, []);

  // ── Fetch footer menus ──
  useEffect(() => {
    fetch("/api/menus")
      .then((r) => r.json())
      .then((d) => {
        const cols = (d.data ?? []).filter((m: any) =>
          ["footer-1", "footer-2", "footer-3"].includes(m.location),
        );
        setFooterMenus(cols);
      });
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

  // ── Fetch post ──
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

  // ── Fetch comments once we have the post id ──
  const fetchComments = useCallback(async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const response = await res.json();

      const commentsData = Array.isArray(response) ? response : [];

      setComments(commentsData);

      const countAll = (arr: Comment[]): number =>
        arr.reduce((acc, c) => acc + 1 + countAll(c.replies ?? []), 0);

      setCommentCount(countAll(commentsData));
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  }, []);

  useEffect(() => {
    if (post?.id) fetchComments(post.id);
  }, [post?.id, fetchComments]);

  // ── postMessage bridge: iframe → parent ──
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const { type, url, payload } = event.data ?? {};

      // Navigation
      if (type === "NAVIGATE" && typeof url === "string") {
        router.push(url);
        return;
      }

      // Comment submit from iframe
      if (type === "SUBMIT_COMMENT" && payload) {
        const {
          postId,
          parentId,
          authorName,
          authorEmail,
          authorUrl,
          content,
        } = payload;

        const res = await fetch(`/api/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorName,
            authorEmail,
            authorUrl,
            content,
            parentId: parentId || null,
          }),
        });

        const data = await res.json();

        // Send result back to iframe
        const iframe = document.querySelector("iframe") as HTMLIFrameElement;
        if (!iframe?.contentWindow) return;

        if (res.ok) {
          // Refresh comments then tell iframe to show success
          await fetchComments(postId);
          iframe.contentWindow.postMessage(
            { type: "COMMENT_SUCCESS", parentId, status: data.status },
            "*",
          );
        } else {
          iframe.contentWindow.postMessage(
            {
              type: "COMMENT_ERROR",
              parentId,
              error: data.error || "Failed to submit",
            },
            "*",
          );
        }
        return;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router, fetchComments]);

  // ── Derived ──
  const headerMenu = useMemo(
    () => menus.find((m) => m.location === "header"),
    [menus],
  );

  if (loading || menusLoading) {
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
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  if (!post) return null;

  // ── Build HTML helpers ──

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

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const categoriesHtml = post.categories?.length
    ? `<div class="post-cats">${post.categories
        .map(
          (c) =>
            `<a href="/posts?category=${c.slug}" class="post-cat" onclick="handleNav(event,'/posts?category=${c.slug}')">${c.name}</a>`,
        )
        .join("")}</div>`
    : "";

  const tagsHtml = post.tags?.length
    ? `<div class="post-tags">${post.tags
        .map(
          (t) =>
            `<a href="/posts?tag=${t.slug}" class="post-tag" onclick="handleNav(event,'/posts?tag=${t.slug}')">#${t.name}</a>`,
        )
        .join("")}</div>`
    : "";

  const featuredImageHtml = post.featuredImage
    ? `<div class="post-featured-image"><img src="${post.featuredImage}" alt="${post.title}" /></div>`
    : "";

  // ── Comments HTML ──
  const commentsHtml = renderCommentTree(comments, post.id);
  const commentLabel =
    commentCount === 0
      ? "No Comments"
      : `${commentCount} Comment${commentCount !== 1 ? "s" : ""}`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const seo = (post as any).seoData || {};
  const isAdmin = (session?.user as any)?.role === "admin";
  const adminToolbarHtml =
    settings?.showAdminToolbar && isAdmin
      ? buildAdminToolbarHtml({
          pageId: post.id,
          siteName: settings.siteName,
          editUrl: `/admin/posts/${post.id}`,
        })
      : "";

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seo.metaTitle || post.title}</title>
  <meta name="description" content="${seo.metaDescription || post.excerpt || ""}">
  <meta name="robots" content="${(seo.robotsIndex !== false ? "index" : "noindex") + "," + (seo.robotsFollow !== false ? "follow" : "nofollow")}">
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
  /* ── Reset ── */
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;min-height:100vh;font-family:system-ui,-apple-system,sans-serif;line-height:1.6}
  body{display:flex;flex-direction:column;background:#fff;color:#111827}

  /* ── Navbar ── */
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

  /* ── Post Layout ── */
  .post-wrapper{flex:1;width:min(740px,calc(100% - 2rem));margin:3rem auto;padding-bottom:4rem}
  .post-cats{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}
  .post-cat{display:inline-block;padding:.25rem .75rem;background:#f3f4f6;color:#374151;text-decoration:none;font-size:.75rem;font-weight:600;border-radius:999px;text-transform:uppercase;letter-spacing:.05em;transition:background .15s}
  .post-cat:hover{background:#e5e7eb}
  .post-title{font-size:clamp(1.75rem,4vw,2.75rem);font-weight:800;color:#111827;line-height:1.2;margin:0 0 1rem;letter-spacing:-.02em}
  .post-meta{display:flex;align-items:center;gap:1rem;color:#6b7280;font-size:.875rem;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #e5e7eb}
  .post-featured-image{margin-bottom:2rem;border-radius:12px;overflow:hidden}
  .post-featured-image img{width:100%;height:auto;display:block;max-height:480px;object-fit:cover}
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
  .post-tags{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid #e5e7eb}
  .post-tag{display:inline-block;padding:.25rem .75rem;background:#f3f4f6;color:#6b7280;text-decoration:none;font-size:.8rem;border-radius:999px;transition:background .15s,color .15s}
  .post-tag:hover{background:#e5e7eb;color:#111827}

  /* ── Comments Section ── */
  .comments-section{margin-top:3rem;padding-top:2.5rem;border-top:2px solid #e5e7eb}
  .comments-title{font-size:1.375rem;font-weight:700;color:#111827;margin:0 0 2rem}

  /* ── Single comment ── */
  .comment-item{display:flex;gap:.875rem;padding:.75rem 0}
  .comment-avatar{flex-shrink:0;width:2.25rem;height:2.25rem;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700}
  .comment-body{flex:1;min-width:0}
  .comment-meta{display:flex;align-items:center;gap:.75rem;margin-bottom:.375rem}
  .comment-author-name{font-weight:600;font-size:.9rem;color:#111827}
  .comment-author-link{font-weight:600;font-size:.9rem;color:#2563eb;text-decoration:none}
  .comment-author-link:hover{text-decoration:underline}
  .comment-time{font-size:.775rem;color:#9ca3af}
  .comment-text{font-size:.9375rem;color:#374151;line-height:1.7;margin:0;white-space:pre-line}
  .comment-actions{margin-top:.375rem}
  .comment-reply-btn{background:none;border:none;color:#6b7280;font-size:.8rem;cursor:pointer;padding:0;font-family:inherit;transition:color .15s}
  .comment-reply-btn:hover{color:#2563eb}

  /* ── Nested replies ── */
  .comment-replies{margin-top:.75rem;padding-left:1.25rem;border-left:2px solid #f3f4f6}

  /* ── Reply form inline ── */
  .reply-form-container{margin-top:.75rem}

  /* ── Comment Form ── */
  .comments-form-section{margin-top:2.5rem;padding-top:2rem;border-top:1px solid #e5e7eb}
  .comments-form-title{font-size:1.125rem;font-weight:600;color:#111827;margin:0 0 1.25rem}
  .comment-form-wrap{display:flex;flex-direction:column;gap:1rem}
  .reply-notice{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:.625rem 1rem;font-size:.875rem;color:#0369a1}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
  @media(max-width:520px){.form-row{grid-template-columns:1fr}}
  .form-group{display:flex;flex-direction:column;gap:.375rem}
  .form-group label{font-size:.85rem;font-weight:500;color:#374151}
  .required{color:#ef4444}
  .form-group input,.form-group textarea{border:1px solid #d1d5db;border-radius:8px;padding:.625rem .875rem;font-size:.9rem;font-family:inherit;outline:none;transition:border-color .15s,box-shadow .15s;color:#111827}
  .form-group input:focus,.form-group textarea:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
  .form-group textarea{resize:vertical;min-height:120px}
  .form-actions{display:flex;gap:.75rem;align-items:center}
  .btn-submit{background:#2563eb;color:#fff;border:none;border-radius:8px;padding:.625rem 1.5rem;font-size:.9rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s}
  .btn-submit:hover{background:#1d4ed8}
  .btn-submit:disabled{opacity:.5;cursor:not-allowed}
  .btn-cancel{background:none;border:1px solid #d1d5db;color:#6b7280;border-radius:8px;padding:.625rem 1rem;font-size:.875rem;cursor:pointer;font-family:inherit;transition:background .15s}
  .btn-cancel:hover{background:#f9fafb}
  .cf-status{border-radius:8px;padding:.75rem 1rem;font-size:.875rem;margin-top:.25rem}
  .cf-status.success{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534}
  .cf-status.pending{background:#fffbeb;border:1px solid #fde68a;color:#92400e}
  .cf-status.error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}

  /* ── Footer ── */
  .cms-footer{margin-top:auto;background:#111827;color:#9ca3af}
  .cms-footer-inner{width:min(1200px,calc(100% - 2rem));margin:0 auto;padding:3rem 0 1.5rem}
  .footer-top{display:grid;grid-template-columns:1fr 2fr;gap:3rem;margin-bottom:2rem}
  .footer-brand-name{color:#fff;text-decoration:none;font-size:1.125rem;font-weight:700}
  .footer-brand-desc{font-size:.875rem;color:#6b7280;margin:.5rem 0 0}
  .footer-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:2rem}
  .footer-col-title{color:#fff;font-size:.875rem;font-weight:600;margin:0 0 1rem;text-transform:uppercase;letter-spacing:.05em}
  .footer-col-links{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem}
  .footer-col-link{color:#6b7280;text-decoration:none;font-size:.875rem;transition:color .15s}
  .footer-col-link:hover{color:#fff}
  .footer-bottom{border-top:1px solid #1f2937;padding-top:1.5rem;text-align:center;font-size:.8rem;color:#4b5563}
  /* ── Global CSS ── */
  ${globalCss || ""}
</style>
</head>
<body>
  ${adminToolbarHtml}

  <nav class="cms-navbar">
    <div class="cms-navbar-inner">
      <a href="/" class="cms-brand" onclick="handleNav(event,'/')">${settings?.siteName || "My Website"}</a>
      <ul class="cms-menu">
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

    <!-- ── Comments ── -->
    <section class="comments-section">
      <h2 class="comments-title">${commentLabel}</h2>
      <div id="comments-list">
        ${commentsHtml}
      </div>

      <!-- Main comment form -->
      <div class="comments-form-section">
        <h3 class="comments-form-title">Leave a Comment</h3>
        ${buildCommentFormHtml(post.id)}
      </div>
    </section>
  </main>

  <footer class="cms-footer">
    <div class="cms-footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="/" class="footer-brand-name" onclick="handleNav(event,'/')">${settings?.siteName || ""}</a>
          ${settings?.footerDescription ? `<p class="footer-brand-desc">${settings.footerDescription}</p>` : ""}
        </div>
        <div class="footer-cols">
          ${footerMenus
            .sort((a, b) => a.location.localeCompare(b.location))
            .map(
              (menu) => `
              <div class="footer-col">
                <h4 class="footer-col-title">${menu.name}</h4>
                <ul class="footer-col-links">
                  ${menu.items
                    .map((item: any) => {
                      const href =
                        item.type === "page" && item.slug
                          ? `/${item.slug}`
                          : item.url || "#";
                      return `<li><a href="${href}" class="footer-col-link" onclick="handleNav(event,'${href}')">${item.label}</a></li>`;
                    })
                    .join("")}
                </ul>
              </div>`,
            )
            .join("")}
        </div>
      </div>
      <div class="footer-bottom">
        <p>${settings?.footerText || `© ${new Date().getFullYear()} ${settings?.siteName || ""}. All rights reserved.`}</p>
      </div>
    </div>
  </footer>

<script>
  // ── Navigation ──
  function handleNav(e, url) {
    e.preventDefault();
    window.parent.postMessage({ type: "NAVIGATE", url }, "*");
  }

  // ── Reply form ──
  function openReplyForm(commentId, authorName) {
    document.querySelectorAll(".reply-form-container").forEach((el) => {
      if (el.id !== "reply-form-" + commentId) {
        el.style.display = "none";
        el.innerHTML = "";
      }
    });

    const container = document.getElementById("reply-form-" + commentId);
    if (!container) return;

    if (container.style.display === "block") {
      container.style.display = "none";
      container.innerHTML = "";
      return;
    }

    // Build the reply form template and replace placeholders
    const formTemplate = ${"`"}${buildCommentFormHtml("__POSTID__", "__PARENTID__", "__AUTHOR__")}${"`"};
    container.innerHTML = formTemplate
      .replace(/__POSTID__/g, "${post.id}")
      .replace(/__PARENTID__/g, commentId)
      .replace(/cf-name-__PARENTID__/g, "cf-name-" + commentId)
      .replace(/cf-email-__PARENTID__/g, "cf-email-" + commentId)
      .replace(/cf-url-__PARENTID__/g, "cf-url-" + commentId)
      .replace(/cf-content-__PARENTID__/g, "cf-content-" + commentId)
      .replace(/cf-status-__PARENTID__/g, "cf-status-" + commentId)
      .replace(/__AUTHOR__/g, authorName);
    container.style.display = "block";
  }

  function cancelReply(parentId) {
    const container = document.getElementById("reply-form-" + parentId);
    if (container) {
      container.style.display = "none";
      container.innerHTML = "";
    }
  }

  // ── Submit comment — now takes explicit suffix ──
  function submitComment(postId, parentId, suffix) {
    const name     = document.getElementById("cf-name-" + suffix)?.value?.trim();
    const email    = document.getElementById("cf-email-" + suffix)?.value?.trim();
    const url      = document.getElementById("cf-url-" + suffix)?.value?.trim();
    const content  = document.getElementById("cf-content-" + suffix)?.value?.trim();
    const statusEl = document.getElementById("cf-status-" + suffix);
    const submitBtn = statusEl?.closest(".comment-form-wrap")?.querySelector(".btn-submit");

    if (!name || !email || !content) {
      showStatus(statusEl, "error", "Name, email and comment are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus(statusEl, "error", "Please enter a valid email address.");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    showStatus(statusEl, null, "");

    window.parent.postMessage({
      type: "SUBMIT_COMMENT",
      payload: {
        postId,
        parentId: parentId || null,
        authorName: name,
        authorEmail: email,
        authorUrl: url || null,
        content,
      },
    }, "*");

    window.__pendingComment = { suffix, statusEl, submitBtn };
  }

  function showStatus(el, type, msg) {
    if (!el) return;
    el.className = "cf-status" + (type ? " " + type : "");
    el.textContent = msg;
    el.style.display = msg ? "block" : "none";
  }

  // ── Receive result from parent ──
  window.addEventListener("message", (event) => {
    const { type, status, error } = event.data ?? {};
    if (!type) return;

    if (type === "COMMENT_SUCCESS") {
      const ctx = window.__pendingComment || {};
      if (ctx.submitBtn) ctx.submitBtn.disabled = false;

      if (status === "APPROVED") {
        showStatus(ctx.statusEl, "success", "✅ Your comment has been posted!");
      } else {
        showStatus(ctx.statusEl, "pending", "✅ Your comment is awaiting moderation.");
        const wrap = ctx.statusEl?.closest(".comment-form-wrap");
        if (wrap) {
          wrap.querySelectorAll("input, textarea").forEach((el) => el.value = "");
        }
      }
      window.__pendingComment = null;
    }

    if (type === "COMMENT_ERROR") {
      const ctx = window.__pendingComment || {};
      if (ctx.submitBtn) ctx.submitBtn.disabled = false;
      showStatus(ctx.statusEl, "error", error || "Something went wrong. Please try again.");
      window.__pendingComment = null;
    }
  });
</script>

</body>
</html>`;

  return (
    <iframe
      key={`${post.id}-${commentCount}`}
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
