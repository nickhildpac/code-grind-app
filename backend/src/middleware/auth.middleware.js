import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    throw new ApiError(401, "User not authorized")
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "invalid crednetials")
  }
  const user = await db.user.findUnique({
    where: {
      id: decoded.id
    },
    select: {
      id: true,
      image: true,
      name: true,
      email: true,
      role: true
    }
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  req.user = user;
  next();
})

export const isAdmin = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  console.log(id);
  const user = await db.user.findUnique({
    where: {
      id
    },
    select: {
      role: true
    }
  });
  console.log(user.role);
  if (!user || user.role !== UserRole.ADMIN) {
    throw new ApiError(403, "Access denied - Admins only");
  }
  next();
})
