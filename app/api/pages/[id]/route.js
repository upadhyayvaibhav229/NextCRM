// import { ApiError } from "next/dist/server/api-utils";
import { asyncHandler } from "../../../lib/utils/asynchandler";
import { ApiResponse } from "../../../lib/utils/ApiResponse,js";
import { deletePage, getPageById, publishPage, unpublishPage, updatePage } from "../../../lib/services/page.service";
import { ApiError } from "../../../lib/utils/ApiError";

// get page by id
export const GET = asyncHandler(async (req, { params }) => {
  const { id } = await params;

  if (!id) {
    throw new ApiError(400, "Page ID is required");
  }

  const findPage = await getPageById(id);

  if (!findPage) {
    throw new ApiError(404, "Page not found");
  }

  return Response.json(
    new ApiResponse(200, findPage, "Page fetched successfully"),
  );
});

// update page by id
export const PUT = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const pageData = await req.json();

  if (!id) {
    throw new ApiError(400, "Page ID is required");
  }

  // handle publish and unpublish status
  if (pageData.action === "publish") {
    const page = await publishPage(id);
    return Response.json(
      new ApiResponse(200, page, "Page Published successfully"),
    );
  }

  if (pageData.action === "unpublish") {
    const page = await unpublishPage(id);
    return Response.json(
      new ApiResponse(200, page, "Page unpublished successfully"),
    );
  }

  const page = await updatePage(id, pageData);
  return Response.json(
    new ApiResponse(200, page, "Page updated successfully"),
  );
});


// delete page by id
export const DELETE = asyncHandler(async (req, { params }) => {
  const { id } = await params;

  if (!id) {
    throw new ApiError(400, "Page ID is required");
  }

  const page = await deletePage(id);

  if (!page) {
    throw new ApiError(404, "Page not found");
  }

//   await deletePage(id);

  return Response.json(
    new ApiResponse(200, page, "Page deleted successfully"),
  );
});
