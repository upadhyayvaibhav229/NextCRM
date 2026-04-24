// import { ApiError } from "next/dist/server/api-utils";

import { getPageBySlug, isSlugAvailable } from "../../../../lib/services/page.service.js";
import { ApiError } from "../../../../lib/utils/ApiError.js";
import { ApiResponse } from "../../../../lib/utils/ApiResponse.js";
import { asyncHandler } from "../../../../lib/utils/asyncHandler.js";

// get pagebyslug

export const GET = asyncHandler(async (req, { params }) => {
  const { slug } = params;
  if (!slug) {
    throw new ApiError(400, "Slug is required");
  }

  const findPage = await getPageBySlug(slug);

  if (!findPage) {
    throw new ApiError(404, "Page not found");
  }

  if (findPage.status !== "published") {
    throw new ApiError(403, "This page is not published yet");
  }

  return Response.json(new ApiResponse(200, findPage, "Page fetched successfully"));
});


// check slug availability
export const POST = asyncHandler(async (req, { params }) => {
  const { slug } = await params
  const body = await req.json()

  if (!slug) {
    throw new ApiError(400, 'Slug is required')
  }

  const available = await isSlugAvailable(slug, body.excludeId)

  return Response.json(
    new ApiResponse(200, { available }, available ? 'Slug is available' : 'Slug is already taken')
  )
})
