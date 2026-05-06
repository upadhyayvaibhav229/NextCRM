import { prisma } from "../prisma";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { ApiError } from "../utils/ApiError";

// Allowed MIME Types
const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Video
  "video/mp4",
  "video/webm",

  // Audio
  "audio/mpeg",
  "audio/wav",
];

// ─────────────────────────────────────────────
// CREATE MEDIA
// ─────────────────────────────────────────────
export async function createMedia(input) {
  const files = Array.isArray(input) ? input : [input];

  const uploadedMedia = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, `Unsupported file type: ${file.type}`);
    }

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
      month,
    );

    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/\s+/g, "-");

    const fileName = `${Date.now()}-${safeName}`;

    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    let width = null;
    let height = null;

    // Only for image files
    if (file.type.startsWith("image/")) {
      const metadata = await sharp(buffer).metadata();

      width = metadata.width ?? null;
      height = metadata.height ?? null;
    }

    const media = await prisma.media.create({
      data: {
        fileName,
        originalName: file.name,
        url: `/uploads/${year}/${month}/${fileName}`,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        title: file.name,
      },
    });

    uploadedMedia.push(media);
  }

  // Return single item if only one uploaded
  return Array.isArray(input) ? uploadedMedia : uploadedMedia[0];
}

// ─────────────────────────────────────────────
// GET ALL MEDIA
// ─────────────────────────────────────────────
export async function getAllMedia({ page = 1, limit = 20, search = "" }) {
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
          {
            title: {
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

// ─────────────────────────────────────────────
// UPDATE MEDIA META
// ─────────────────────────────────────────────
export async function updateMedia(id, input) {
  return prisma.media.update({
    where: {
      id: Number(id),
    },
    data: {
      altText: input.altText ?? null,
      title: input.title ?? null,
      caption: input.caption ?? null,
      description: input.description ?? null,
    },
  });
}

// ─────────────────────────────────────────────
// DELETE MEDIA
// ─────────────────────────────────────────────

export async function deleteMedia(id) {
  const media = await prisma.media.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  const filePath = path.join(process.cwd(), "public", media.url);

  await fs.unlink(filePath).catch(() => null);

  await prisma.media.delete({
    where: {
      id: Number(id),
    },
  });

  return true;
}

// bulk delete
export async function bulkDeleteMedia(ids) {
  return prisma.media.deleteMany({
    where: {
      id: {
        in: ids.map(Number),
      },
    },
  });
}
