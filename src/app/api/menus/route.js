import { createMenu, getAllMenus } from "../../lib/services/menu.service.js";
import { ApiError } from "../../lib/utils/ApiError.js";
import { ApiResponse } from "../../lib/utils/ApiResponse.js";
import { asyncHandler } from "../../lib/utils/asyncHandler.js";

const VALID_LOCATIONS = ['header', 'footer']

// GET /api/menus
export const GET = asyncHandler(async () => {
  const menus = await getAllMenus()

  return Response.json(
    new ApiResponse(200, menus, 'Menus fetched successfully')
  )
})

// POST /api/menus
export const POST = asyncHandler(async (req) => {
  const menuData = await req.json()

  if (!menuData.name) {
    throw new ApiError(400, 'Menu name is required')
  }

  if (!menuData.location) {
    throw new ApiError(400, 'Menu location is required')
  }

  if (!VALID_LOCATIONS.includes(menuData.location)) {
    throw new ApiError(400, 'Location must be header or footer')
  }

  const menu = await createMenu(menuData)

  return Response.json(
    new ApiResponse(201, menu, 'Menu created successfully'),
    { status: 201 }
  )
})
