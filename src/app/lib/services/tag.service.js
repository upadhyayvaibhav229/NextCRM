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
  const existing = await model.findUnique(
    { 
      where: { 
        slug 
      } 
    }
  );
  if (!existing) return slug;
  if (excludeId && existing.id === excludeId) return slug;
  throw new Error(`Slug "${slug}" is already taken`);
}


// ═══════════════════════════════════════════════════════════
// TAG SERVICES
// ═══════════════════════════════════════════════════════════

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

export async function getTagById(id) {
  return prisma.tag.findUnique({
    where: { id },
    include: { posts: { select: { id: true, title: true, slug: true } } },
  });
}

export async function createTag(input) {
  const slug = input.slug?.trim()
    ? generateSlug(input.slug)
    : generateSlug(input.name);
  await ensureUniqueSlug(prisma.tag, slug);
  return prisma.tag.create({
    data: { name: input.name, slug },
  });
}

export async function updateTag(id, input) {
  const { id: _, ...rest } = input;
  if (rest.name && !rest.slug) rest.slug = generateSlug(rest.name);
  if (rest.slug) {
    rest.slug = generateSlug(rest.slug);
    await ensureUniqueSlug(prisma.tag, rest.slug, id);
  }
  return prisma.tag.update({ where: { id }, data: rest });
}

export async function deleteTag(id) {
  return prisma.tag.delete({ where: { id } });
}


export async function BulkDeleteTags(id) {
  return prisma.tag.deleteMany({
    where: {
      id: {
        in: id.map(Number),
      },
    }
  })
}