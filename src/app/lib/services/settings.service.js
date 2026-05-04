import { prisma } from "../prisma.js";

// GET setting by key
export async function getSetting(key) {
  const setting = await prisma.footerSettings.findUnique({
    where: { key },
  });

  return setting ? setting.value : null;
}

// GET all settings
export async function getAllSettings() {
  const settings = await prisma.footerSettings.findMany();

  return settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
}

// UPSERT
export async function upsertSetting(key, value) {
  return prisma.footerSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// DELETE
export async function deleteSetting(key) {
  return prisma.footerSettings.delete({
    where: { key },
  });
}