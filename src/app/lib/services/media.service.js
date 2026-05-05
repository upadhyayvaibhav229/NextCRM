import { prisma } from "../prisma";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError";

// ─────────────────────────────────────────────
// CREATE MEDIA
// ─────────────────────────────────────────────
export async function createMedia(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    year,
    month
  );

  await fs.mkdir(uploadDir, { recursive: true });

  const fileName =
    Date.now() + "-" + file.name.replace(/\s+/g, "-");

  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  const metadata = await sharp(buffer).metadata();

  return prisma.media.create({
    data: {
      fileName,
      originalName: file.name,
      url: `/uploads/${year}/${month}/${fileName}`,
      mimeType: file.type,
      size: file.size,
      width: metadata.width ?? null,
      height: metadata.height ?? null,
    },
  });
}

// ─────────────────────────────────────────────
// GET ALL MEDIA
// ─────────────────────────────────────────────
export async function getAllMedia({
  page = 1,
  limit = 20,
  search = "",
}) {
  page = Number(page);
  limit = Number(limit);

  const where = search
    ? {
        OR: [
          {
            fileName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            originalName: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.media.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// update Media

export async function updateMedia(id, input) {
  return prisma.media.update({
    where: { id: Number(id) },
    data: {
      altText: input.altText,
      title: input.title,
      caption: input.caption,
      description: input.description

    }
  })
}

// ─────────────────────────────────────────────
// DELETE MEDIA
// ─────────────────────────────────────────────
export async function deleteMedia(id) {
  const media = await prisma.media.findUnique({
    where: { id: Number(id) },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    media.url
  );

  await fs.unlink(filePath).catch(() => null);

  await prisma.media.delete({
    where: { id: Number(id) },
  });

  return true;
}