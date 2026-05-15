import { prisma } from "../prisma.js";
import { requirePermission } from "../withPermission.js";

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
  await requirePermission("settings_manage");

  return prisma.footerSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// DELETE
export async function deleteSetting(key) {
  await requirePermission("settings_manage");

  return prisma.footerSettings.delete({
    where: { key },
  });
}
