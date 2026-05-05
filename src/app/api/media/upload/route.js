import { createMedia } from "@/src/app/lib/services/media.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const POST = asyncHandler(async (req) => {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    throw new ApiError(400, "File is required");
  }

  const media = await createMedia(file);
  return Response.json(
    new ApiResponse(200, media, "Media created successfully"),
  );
});
