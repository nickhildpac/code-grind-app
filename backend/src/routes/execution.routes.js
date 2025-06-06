import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { executionCode } from "../controllers/executeCode.controller.js";

const executionRoute = express.Router();

executionRoute.post("/", authMiddleware, executionCode);

export default executionRoute
