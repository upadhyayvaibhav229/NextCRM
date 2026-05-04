import { prisma } from "../prisma.js";

// Singleton Settings Record ID
const SETTINGS_ID = 1;

// ──────────────────────────────────────────────
// GET SETTINGS
// ──────────────────────────────────────────────
export async function getSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  // Auto-create singleton record if missing
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: SETTINGS_ID },
    });
  }

  return settings;
}

// ──────────────────────────────────────────────
// UPDATE SETTINGS
// ──────────────────────────────────────────────
export async function updateSettings(input) {
  await getSettings(); // ensure record exists

  return prisma.siteSettings.update({
    where: { id: SETTINGS_ID },
    data: {
      siteName: input.siteName,
      siteTagline: input.siteTagline,
      logo: input.logo,
      favicon: input.favicon,
      defaultMetaTitle: input.defaultMetaTitle,
      defaultMetaDescription: input.defaultMetaDescription,
      postsPerPage:
        input.postsPerPage !== undefined
          ? Number(input.postsPerPage)
          : undefined,
    },
  });
}