import { prisma } from "../prisma.js";

const SETTINGS_ID = 1;

// GET SETTINGS
export async function getSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: SETTINGS_ID },
    });
  }

  return settings;
}

// UPDATE SETTINGS
export async function updateSettings(input) {
  await getSettings();

  // Validation
  if (input.homepageType === "page" && !input.homepagePageId) {
    throw new Error("Homepage page is required when homepage type is page");
  }

  if (
    input.homepagePageId &&
    input.postsPageId &&
    Number(input.homepagePageId) === Number(input.postsPageId)
  ) {
    throw new Error("Homepage and Posts Page cannot be the same");
  }

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

      homepageType: input.homepageType,
      homepagePageId:
        input.homepagePageId !== undefined
          ? Number(input.homepagePageId)
          : undefined,

      postsPageId:
        input.postsPageId !== undefined
          ? Number(input.postsPageId)
          : undefined,
    },
  });
}