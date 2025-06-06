import express from "express";
import { login, logout, me, register } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { googleCallback, googleLogin } from "../controllers/oauthgoogle.controller.js";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authMiddleware, me);
authRoutes.get("/google", googleLogin);
authRoutes.get("/google/callback", googleCallback);


export default authRoutes;
