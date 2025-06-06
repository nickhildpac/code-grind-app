import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";
import {
  verifyGoogleToken,
  generateNonce,
  generateState,
} from "../utils/authGoogle.js";
import axios from "axios";

export const googleLogin = (req, res) => {
  // Generate state and nonce for CSRF protection and replay attack prevention
  const state = generateState();
  const nonce = generateNonce();

  // Store state and nonce in session cookies
  res.cookie("oauth_state", state, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });
  res.cookie("oauth_nonce", nonce, {
    httpOnly: true,
    maxAge: 600000,
    sameSite: "lax",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=email%20profile%20openid&state=${state}&nonce=${nonce}`;

  // Redirect the user to the Google login page
  res.redirect(googleAuthUrl);
};

//  Handle Google Callback and Exchange Code for Tokens
export const googleCallback = async (req, res) => {
  try {
    // Check if the state matches the one stored in the cookie
    const { code, state } = req.query;
    const savedState = req.cookies.oauth_state;
    const savedNonce = req.cookies.oauth_nonce;

    // Clear the cookies after use
    res.clearCookie("oauth_state");
    res.clearCookie("oauth_nonce");

    if (!state || !savedState || state !== savedState) {
      return res.status(401).json({ message: "Invalid state parameter" });
    }

    // Exchange code for Google tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          code,
          grant_type: "authorization_code",
        },
      },
    );
    console.log(tokenResponse);
    const { id_token, access_token, refresh_token } = tokenResponse.data;
    if (!id_token) {
      return res.status(401).json({ message: "Invalid ID token" });
    }

    // Verify the ID token
    const decodedToken = await verifyGoogleToken(id_token);
    console.log(decodedToken);
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid ID token" });
    }

    // Check if the nonce matches the one stored in the cookie
    if (!decodedToken.nonce || decodedToken.nonce !== savedNonce) {
      return res.status(401).json({ message: "Invalid nonce parameter" });
    }
    console.log("Crate user on prisma ");

    // Find or create the user in the database
    let user = await db.user.findFirst({
      where: { googleId: decodedToken.sub },
    });
    if (!user) {
      user = await db.user.create({
        data: {
          googleId: decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name,
          refreshToken: refresh_token || null,
          role: "ADMIN",
        },
      });
    } else if (refresh_token) {
      // Update the refresh token if it has changed
      user = await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: refresh_token,
        },
      });
    }

    // Generate our own JWT token for the user
    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );

    // Set the JWT token in a cookie
    res.cookie("access_token", accessToken, {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.redirect("http://localhost:5173");
    // res.json({
    //   message: "Login successful",
    //   user: {
    //     id: user._id,
    //     email: user.email,
    //     name: user.name,
    //   },
    // });
  } catch (error) {
    console.error(
      "OAuth Callback Error:",
      error.response?.data || error.message,
    );
    res.redirect("http://localhost:5173");
    // res.status(500).json({ message: "Authentication failed" });
  }
};
