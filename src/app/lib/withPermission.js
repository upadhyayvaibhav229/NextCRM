import { getServerSession }        from "next-auth";
import { authOptions }             from "@/src/app/lib/auth";
import { ApiError }                from "@/src/app/lib/utils/ApiError";
import { prisma }                  from "@/src/app/lib/prisma";
import { canManageUser }           from "./permissions";
import { ensurePermissionsSeeded } from "./startup";
// import { ensurePermissionsSeeded } from "../../lib/startup.js";

// ── Get session or throw 401 ──────────────────────────────

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new ApiError(401, "Unauthorized — please log in");
  return session;
}

// ── Check permission purely from DB ──────────────────────

async function checkPermissionFromDB(role, permission, userId) {
  // SUPER_ADMIN always has everything
  if (role === "SUPER_ADMIN") return true;

  // 1. User-specific override
  const userOverride = await prisma.userPermission.findFirst({
    where: {
      userId,
      permission: { name: permission },
    },
  });

  if (userOverride !== null) {
    return userOverride.allowed;
  }

  // 2. Role permission from DB — no fallback
  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      role,
      permission: { name: permission },
    },
  });

  return rolePermission !== null;
}

// ── Require a specific permission ─────────────────────────

export async function requirePermission(permission) {
  const session = await requireAuth();
  const role    = session.user.role;
  const userId  = Number(session.user.id);

  // Auto-seed on first run
  await ensurePermissionsSeeded();

  const allowed = await checkPermissionFromDB(role, permission, userId);

  if (!allowed) {
    throw new ApiError(
      403,
      `Forbidden — you don't have permission: ${permission}`,
    );
  }

  return { session, role, userId };
}

// ── Require actor can manage target user ──────────────────

export async function requireCanManageUser(targetUserId) {
  const session   = await requireAuth();
  const actorRole = session.user.role;
  const actorId   = Number(session.user.id);

  const targetUser = await prisma.user.findUnique({
    where:  { id: targetUserId },
    select: { role: true },
  });

  if (!targetUser) throw new ApiError(404, "User not found");
  if (actorId === targetUserId) {
    throw new ApiError(400, "Cannot manage your own account this way");
  }
  if (!canManageUser(actorRole, targetUser.role)) {
    throw new ApiError(
      403,
      "Forbidden — you cannot manage a user with equal or higher role",
    );
  }

  return { session, actorRole, targetUser };
}