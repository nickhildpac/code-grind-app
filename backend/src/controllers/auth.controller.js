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
      email
    }
  })
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
      role: UserRole.USER
    }
  })
  const token = jwt.sign({
    id: newUser.id
  },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
  console.log(token);
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.status(201).json(
    new ApiResponse(201, {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    }, "User created successfully"
    ));

});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await db.user.findUnique({
    where: {
      email
    }
  });
  if (!user) {
    throw new ApiError(401, "invalid user");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "invalid credentials");
  }
  const token = jwt.sign({
    id: user.id
  }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.status(200).json(
    new ApiResponse(200, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }, "User loggedin successfully"
    )
  );
});

const logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true
  });
  res.status(204).json(
    new ApiResponse(204, {}, "User logged out")
  );
}

const me = async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, req.user, "User authenticated successfully")
  )
}

export {
  register,
  login,
  logout,
  me
}
