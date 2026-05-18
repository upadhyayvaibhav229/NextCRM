import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { requirePermission } from "@/src/lib/withPermission";
import {
  getFormById,
  updateForm,
  deleteForm,
} from "@/lib/services/form.service";

export const GET = asyncHandler(async (req, { params }) => {
  await requirePermission("settings_manage");

  const form = await getFormById(params.id);

  return Response.json(
    new ApiResponse(200, form, "Form fetched"),
    { status: 200 }
  );
});

export const PATCH = asyncHandler(async (req, { params }) => {
  await requirePermission("settings_manage");

  const body = await req.json();

  const updated = await updateForm(params.id, body);

  return Response.json(
    new ApiResponse(200, updated, "Form updated"),
    { status: 200 }
  );
});

export const DELETE = asyncHandler(async (req, { params }) => {
  await requirePermission("settings_manage");

  await deleteForm(params.id);

  return Response.json(
    new ApiResponse(200, null, "Form deleted"),
    { status: 200 }
  );
});