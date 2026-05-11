const asyncHandler = (requestHandler) => {
  return async (...args) => {
    try {
      return await requestHandler(...args);
    } catch (err) {
      console.error("🔥 BACKEND ERROR:", err);

      let message =
        err.message || "Internal Server Error";

      // Prisma readable errors
      if (
        message.includes("Expected Int") ||
        message.includes("Invalid value provided")
      ) {
        message = "Invalid data type provided";
      }

      if (
        message.includes("Foreign key constraint")
      ) {
        message = "Related record not found";
      }

      if (
        message.includes("Unique constraint")
      ) {
        message = "Record already exists";
      }

      return Response.json(
        {
          success: false,
          message,
          errors:
            process.env.NODE_ENV === "development"
              ? err.errors || []
              : [],
          data: null,
        },
        {
          status: err.statusCode || 500,
        },
      );
    }
  };
};

export { asyncHandler };