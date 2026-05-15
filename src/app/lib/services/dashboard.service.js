import { prisma } from "../prisma.js";
import { requirePermission } from "../withPermission.js";

// ──────────────────────────────────────────────
// DASHBOARD DATA
// ──────────────────────────────────────────────
export async function getDashboardData() {
  await requirePermission("posts_view");

  const [
    pagesCount,
    postsCount,
    draftPostsCount,
    publishedPostsCount,
    categoriesCount,
    tagsCount,
    menusCount,
    recentPages,
    recentPosts,
  ] = await Promise.all([
    prisma.page.count(),

    prisma.post.count(),

    prisma.post.count({
      where: { status: "DRAFT" },
    }),

    prisma.post.count({
      where: { status: "PUBLISHED" },
    }),

    prisma.category.count(),

    prisma.tag.count(),

    prisma.menu.count(),

    prisma.page.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),

    prisma.post.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    stats: {
      pages: pagesCount,
      posts: postsCount,
      draftPosts: draftPostsCount,
      publishedPosts: publishedPostsCount,
      categories: categoriesCount,
      tags: tagsCount,
      menus: menusCount,
    },

    recentPages,
    recentPosts,
  };
}
