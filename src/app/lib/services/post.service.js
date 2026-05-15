// lib/services/posts.service.js

import { prisma } from "../prisma.js";
import { requirePermission } from "../withPermission.js";

// ─── Helpers ──────────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function ensureUniqueSlug(model, slug, excludeId = null) {
  const existing = await model.findUnique({
    where: {
      slug,
    },
  });
  if (!existing) return slug;
  if (excludeId && existing.id === excludeId) return slug;
  throw new Error(`Slug "${slug}" is already taken`);
}

// ═══════════════════════════════════════════════════════════
// POST SERVICES
// ═══════════════════════════════════════════════════════════

export async function getAllPosts() {
  await requirePermission("posts_view");

  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      categories: { select: { id: true, name: true } },
      tags: { select: { id: true, name: true } },
    },
  });
}

export async function getPostById(id) {
  await requirePermission("posts_view");

  return prisma.post.findUnique({
    where: { id },
    include: {
      categories: true,
      tags: true,
    },
  });
}

export async function getPostBySlug(slug) {
  return prisma.post.findFirst({
    where: { slug },
    include: {
      categories: true,
      tags: true,
    },
  });
}

export async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      categories: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function createPost(input) {
  await requirePermission("posts_create");

  const slug = input.slug?.trim()
    ? generateSlug(input.slug)
    : generateSlug(input.title);
  await ensureUniqueSlug(prisma.post, slug);

  const { categoryIds = [], tagIds = [], ...rest } = input;
  console.log("POST INPUT:", input);
  return prisma.post.create({
    data: {
      ...rest,
      slug,
      publishedAt:
        rest.status === "PUBLISHED" ? (rest.publishedAt ?? new Date()) : null,
      categories: { connect: categoryIds.map((id) => ({ id })) },
      tags: { connect: tagIds.map((id) => ({ id })) },
    },
    include: { categories: true, tags: true },
  });
}

export async function updatePost(id, input) {
  await requirePermission("posts_edit_any");

  const { id: _, createdAt, updatedAt, categoryIds, tagIds, ...rest } = input;

  if (rest.title && !rest.slug) rest.slug = generateSlug(rest.title);
  if (rest.slug) {
    rest.slug = generateSlug(rest.slug);
    await ensureUniqueSlug(prisma.post, rest.slug, id);
  }

  // Auto-set publishedAt when first publishing
  if (rest.status === "PUBLISHED" && !rest.publishedAt) {
    rest.publishedAt = new Date();
  }
  if (rest.status === "DRAFT") {
    rest.publishedAt = null;
  }

  return prisma.post.update({
    where: { id },
    data: {
      ...rest,
      ...(categoryIds !== undefined && {
        categories: { set: categoryIds.map((id) => ({ id })) },
      }),
      ...(tagIds !== undefined && {
        tags: { set: tagIds.map((id) => ({ id })) },
      }),
    },
    include: { categories: true, tags: true },
  });
}

export async function deletePost(id) {
  await requirePermission("posts_delete_any");

  return prisma.post.delete({
    where: {
      id,
    },
  });
}

export async function BulkDeletePosts(ids) {
  await requirePermission("posts_delete_any");

  return prisma.post.deleteMany({
    where: {
      id: {
        in: ids.map(Number),
      },
    },
  });
}

export async function publishPost(id) {
  await requirePermission("posts_publish");

  return prisma.post.update({
    where: {
      id,
    },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
}

export async function unpublishPost(id) {
  await requirePermission("posts_publish");

  return prisma.post.update({
    where: { id },
    data: { status: "DRAFT", publishedAt: null },
  });
}

export async function isPostSlugAvailable(slug, excludeId) {
  const existing = await prisma.post.findUnique({
    where: {
      slug,
    },
  });
  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
}
