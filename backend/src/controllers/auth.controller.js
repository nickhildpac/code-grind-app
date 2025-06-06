import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });
  console.log(email);
  if (existingUser) {
    console.log(email);
    throw new ApiError(400, "User already exist");
  }
  console.log(email); 
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: UserRole.USER,
    },
  });
  const refreshToken = jwt.sign(
    {
      id: newUser.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
  const accessToken = jwt.sign(
    {
      id: newUser.id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
  const updatedUser = await db.user.update({
    where: {
      id: newUser.id,
    },
    data: {
      refreshToken: refreshToken,
    },
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json(
    new ApiResponse(
      201,
      {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
      "User created successfully",
    ),
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new ApiError(401, "invalid user");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "invalid credentials");
  }
  const refreshToken = jwt.sign(
    {
      id: user.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
  const updatedUser = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: refreshToken,
    },
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  const accessToken = jwt.sign(
    {
      id: user.id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        refreshToken: updatedUser.refreshToken,
      },
      "User loggedin successfully",
    ),
  );
});

const logout = async (req, res) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
  });
  res.clearCookie("access_token", {
    httpOnly: true,
  });
  res.status(204).json(new ApiResponse(204, {}, "User logged out"));
};

const me = async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User authenticated successfully"));
};

export { register, login, logout, me };
