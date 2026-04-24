import { asyncHandler } from "../../../../../lib/utils/asyncHandler.js"
import { ApiError } from "../../../../../lib/utils/ApiError.js"
import { ApiResponse } from "../../../../../lib/utils/ApiResponse.js"
import {
  updateMenuItem,
  deleteMenuItem,
} from "../../../../../lib/services/menu.service.js"

// PUT /api/menus/:id/items/:itemId — update single item
export const PUT = asyncHandler(async (req, { params }) => {
  const { itemId } = await params
  const itemUpdates = await req.json()

  if (!itemUpdates.label) {
    throw new ApiError(400, 'Item label is required')
  }

  const item = await updateMenuItem(itemId, itemUpdates).catch(() => {
    throw new ApiError(404, 'Menu item not found')
  })

  return Response.json(
    new ApiResponse(200, item, 'Menu item updated successfully')
  )
})

// DELETE /api/menus/:id/items/:itemId — delete single item
export const DELETE = asyncHandler(async (req, { params }) => {
  const { itemId } = await params

  await deleteMenuItem(itemId).catch(() => {
    throw new ApiError(404, 'Menu item not found')
  })

  return Response.json(
    new ApiResponse(200, null, 'Menu item deleted successfully')
  )
})
