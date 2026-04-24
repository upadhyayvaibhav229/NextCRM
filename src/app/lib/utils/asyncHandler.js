const asyncHandler = (requestHandler) => {
  return async (...args) => {
    try {
      return await requestHandler(...args);
    } catch (err) {
        console.error("🔥 BACKEND ERROR:", err); // ✅ MUST
      const status = err.statusCode || 500;
      return Response.json(
        {
          success: false,
          message: err.message || "Internal Server Error",
          errors: err.errors || [],
        },
        { status },
      );
    }
  };
};

export { asyncHandler };

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
