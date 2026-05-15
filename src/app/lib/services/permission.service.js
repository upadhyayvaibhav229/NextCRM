import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../permissions.js";
import { prisma } from "../prisma.js";
import { requirePermission } from "../withPermission.js";
// import {
//   DEFAULT_ROLE_PERMISSIONS,
//   ALL_PERMISSIONS,
// } from "../../src/lib/permissions.js";

// ── Seed all permissions to DB ────────────────────────────

export async function seedPermissions() {
  await requirePermission("settings_manage");

  const results = [];

  for (const name of ALL_PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
        description: formatPermissionLabel(name),
      },
    });
    results.push(permission);
  }

  return results;
}

// ── Seed role-permission mappings ─────────────────────────

export async function seedRolePermissions() {
  await requirePermission("settings_manage");

  // First seed permissions
  const results = [];

  for (const name of ALL_PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: {
        name,
      },
      update: {},
      create: {
        name,
        description: formatPermissionLabel(name),
      },
    });
    results.push(permission);
  }

  for (const [permName, roles] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const permission = await prisma.permission.findUnique({
      where: { name: permName },
    });
    if (!permission) continue;

    for (const role of roles) {
      console.log({
        role,
        permissionId: permission.id,
      });

      await prisma.rolePermission.create({
        data: {
          role,
          permissionId: permission.id,
        },
      });
    }
  }

  return {
    success: true,
  };
}

// ── Get all permissions ───────────────────────────────────

export async function getAllPermissions() {
  await requirePermission("users_view");

  return prisma.permission.findMany({
    orderBy: { name: "asc" },
    include: {
      roles: { select: { role: true } },
    },
  });
}

// ── Get permissions for a role ────────────────────────────

export async function getPermissionsForRole(role) {
  await requirePermission("users_view");

  const rolePerms = await prisma.rolePermission.findMany({
    where: { role },
    include: { permission: true },
  });
  return rolePerms.map((rp) => rp.permission);
}

export async function toggleRolePermission(role, permissionName, allowed) {
  const permission = await prisma.permission.findUnique({
    where: { name: permissionName },
  });
  if (!permission) throw new Error(`Permission "${permissionName}" not found`);

  if (allowed) {
    // Add permission to role
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { role, permissionId: permission.id },
    });
  } else {
    // Remove permission from role
    await prisma.rolePermission.deleteMany({
      where: { role, permissionId: permission.id },
    });
  }

  return { success: true };
}
// ── Helper ────────────────────────────────────────────────

function formatPermissionLabel(name) {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
