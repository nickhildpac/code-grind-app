import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getProblemsById, updateProblem } from "../controllers/problem.controllers.js";

const problemRoutes = express.Router();

problemRoutes.post("/create-problem", authMiddleware, isAdmin, createProblem);
problemRoutes.get("/get-all-problem", authMiddleware, getAllProblems);
problemRoutes.get("/get-problem/:id", authMiddleware, getProblemsById);
problemRoutes.put("/update-problem/:id", authMiddleware, isAdmin, updateProblem);
problemRoutes.delete("/delete-problem/:id", authMiddleware, isAdmin, deleteProblem);
problemRoutes.get("/get-solved-problem", authMiddleware, getAllProblemsSolvedByUser);

export default problemRoutes;
