import { getFormById } from "../../../../lib/services/form.service";
import { ApiError } from "../../../../lib/utils/ApiError";
import { ApiResponse } from "../../../../lib/utils/ApiResponse";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
    const form = await getFormById(params.slug);
    if (!form) {
        throw new ApiError(404, "Form not found");
    }

    return Response.json(
        new ApiResponse(200, form, "Form fetched"),
        { status: 200 }
    );
})