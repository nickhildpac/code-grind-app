import { db } from "../libs/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAllSubmissions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const submissions = await db.submission.findMany({
    where: {
      userId: userId,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, submissions, "Submission fetched successfully"));
});

export const getSubmissionForProblem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const problemId = req.params.problemId;
  const submissions = await db.submission.findMany({
    where: {
      userId: userId,
      problemId: problemId,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, submissions, "Submission fetched successfully"));
});

export const getAllSubmissionsCountForProblem = asyncHandler(
  async (req, res) => {
    const problemId = req.params.problemId;
    const submission = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });
    res
      .status(200)
      .json(
        new ApiResponse(200, submission, "Submission fetched successfully"),
      );
  },
);
