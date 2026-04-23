import { prisma } from "@/lib/prisma";

// ─── Helpers ──────────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Services ─────────────────────────────────────────────

// GET all pages
export async function getAllPages() {
  return prisma.page.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// GET single page by ID
export async function getPageById(id) {
  return prisma.page.findUnique({
    where: { id: Number(id) },
  });
}

// GET single page by slug (for public renderer)
export async function getPageBySlug(slug) {
  return prisma.page.findUnique({
    where: {
      slug,
      status: "published",
    },
  });
}

// GET only published pages (for public site)
export async function getPublishedPages() {
  return prisma.page.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
    },
  });
}

// CREATE page
export async function createPage(input) {
  const slug = input.slug?.trim()
    ? generateSlug(input.slug)
    : generateSlug(input.title);
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`Slug "${slug}" is already taken`);
  }

  return prisma.page.create({
    data: {
      title: input.title,
      slug,
      html: input.html,
      css: input.css ?? "",
      js: input.js ?? "",
      status: input.status ?? "draft",
    },
  });
}

// UPDATE page
export async function updatePage(id, input) {
  if (input.title && !input.slug) {
    input.slug = generateSlug(input.title);
  }

  if (input.slug) {
    const existing = await prisma.page.findUnique({
      where: { slug: input.slug },
    });
    if (existing && existing.id !== Number(id)) {
      throw new Error(`Slug "${input.slug}" is already taken`);
    }
  }

  return prisma.page.update({
    where: { id: Number(id) },
    data: {
      ...input,
    //   updatedAt: new Date(),
    },
  });
}

// DELETE page
export async function deletePage(id) {
  return prisma.page.delete({
    where: { id: Number(id) },
  });
}

// PUBLISH page
export async function publishPage(id) {
  return prisma.page.update({
    where: { id: Number(id) },
    data: { status: "published" },
  });
}

// UNPUBLISH page (back to draft)
export async function unpublishPage(id) {
  return prisma.page.update({
    where: { id: Number(id) },
    data: { status: "draft" },
  });
}

// CHECK if slug is available (for live slug validation in editor)
export async function isSlugAvailable(slug, excludeId) {
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (!existing) return true;
  if (excludeId && existing.id === Number(excludeId)) return true;
  return false;
}
