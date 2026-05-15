import { getServerSession } from "next-auth";

import { authOptions } from "@/src/app/lib/auth";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "@/src/app/lib/services/user.service";

import {
  requireCanManageUser,
  requirePermission,
} from "@/src/app/lib/withPermission";

import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

// GET /api/users/[id]
export const GET = asyncHandler(async (req, { params }) => {
  await requirePermission("users_view");

  const user = await getUserById(params.id);

  return Response.json(
    new ApiResponse(200, user, "User fetched successfully"),
    { status: 200 },
  );
});

// PATCH /api/users/[id]
export const PATCH = asyncHandler(async (req, { params }) => {
  await requirePermission("users_edit");

  await requireCanManageUser(Number(params.id));

  const body = await req.json();

  const updated = await updateUser(params.id, body);

  return Response.json(
    new ApiResponse(200, updated, "User updated successfully"),
    { status: 200 },
  );
});

// DELETE /api/users/[id]
export const DELETE = asyncHandler(async (req, { params }) => {
  await requirePermission("users_delete");

  const session = await getServerSession(authOptions);

  const actorRole = session?.user?.role;

  await deleteUser(params.id, actorRole);

  return Response.json(
    new ApiResponse(200, null, "User deleted successfully"),
    { status: 200 },
  );
});
