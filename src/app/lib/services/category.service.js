// lib/services/posts.service.js

import { prisma } from "../prisma.js";

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
// CATEGORY SERVICES
// ═══════════════════════════════════════════════════════════

export async function getAllCategories() {
  return prisma.category.findMany({ 
  orderBy: { name: "asc" },
  include: {
    parent: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        posts: true,
        children: true,
      },
    },
  },
});
}

export async function getCategoryById(id) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      posts: {
        select: {
          id: true,
          title: true,
          slug: true,
        },

      },
      
    },
  });
}

export async function createCategory(input) {
  const slug = input.slug?.trim()
    ? generateSlug(input.slug)
    : generateSlug(input.name);
  await ensureUniqueSlug(prisma.category, slug);
  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      parentId: input.parentId || null,
    },
  });
}

export async function updateCategory(id, input) {
  const { id: _, _count, posts, createdAt, updatedAt, ...rest } = input;

  if (rest.name && !rest.slug) rest.slug = generateSlug(rest.name);
  if (rest.slug) {
    rest.slug = generateSlug(rest.slug);
    await ensureUniqueSlug(prisma.category, rest.slug, id);
  }

  if (rest.parentId === id) {
    throw new Error("Category cannot be its own parent");
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...rest,
      description: rest.description ?? null,
      parentId: rest.parentId || null,
    },
  });
}

export async function deleteCategory(id) {
  return prisma.category.delete({ where: { id } });
}
