import { addMenuItem, getMenuById, reorderMenuItems } from "../../../../lib/services/menu.service.js"
import { asyncHandler } from "../../../../lib/utils/asyncHandler.js"
import { ApiError } from "../../../../lib/utils/ApiError.js"
import { ApiResponse } from "../../../../lib/utils/ApiResponse.js"

// POST /api/menus/:id/items — add item to menu
export const POST = asyncHandler(async (req, { params }) => {
  const { id } = await params
  const itemData = await req.json()

  if (!itemData.label) {
    throw new ApiError(400, 'Item label is required')
  }

  if (!itemData.slug && !itemData.url) {
    throw new ApiError(400, 'Item must have a slug or a url')
  }

  const menu = await getMenuById(id)
  if (!menu) {
    throw new ApiError(404, 'Menu not found')
  }

  const item = await addMenuItem(id, itemData)

  return Response.json(
    new ApiResponse(201, item, 'Menu item added successfully'),
    { status: 201 }
  )
})

// PUT /api/menus/:id/items — reorder items
export const PUT = asyncHandler(async (req, { params }) => {
  const { id } = await params
  const { items } = await req.json()

  if (!items || !Array.isArray(items)) {
    throw new ApiError(400, 'Items array is required')
  }

  const reordered = await reorderMenuItems(Number(id), items)

  return Response.json(
    new ApiResponse(200, reordered, 'Menu items reordered successfully')
  )
})