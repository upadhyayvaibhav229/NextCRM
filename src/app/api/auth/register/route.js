import { prisma } from "@/src/app/lib/prisma";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import bcrypt from "bcryptjs";

export const POST = asyncHandler(async (req) => {
  // take inputs
  const { email, password, role } = await req.json();

  // validate
  if (!email?.trim()) throw new ApiError(400, "Email is required");
  if (!password?.trim()) throw new ApiError(400, "Password is required");
  if (!role?.trim()) throw new ApiError(400, "Role is required");

  const exisitngUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  
  if (exisitngUser) {
    throw new ApiError(400, "User already exists");
  }
  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  });

  const { password: _, ...safeUser } = user;

  return Response.json(
    new ApiResponse(201, safeUser, "User created successfully"),
    {
      status: 201,
    },
  );
});
