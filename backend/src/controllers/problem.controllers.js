import { UserRole } from "../generated/prisma/index.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { ApiError } from "../utils/ApiError.js";
import axios from "axios";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { db } from '../libs/db.js';

export const createProblem = asyncHandler(async (req, res, next) => {
  const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body;
  if (req.user.role !== UserRole.ADMIN) {
    throw new ApiError(403, "Not authorized to create a problem")
  }
  for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    const languageId = getJudge0LanguageId(language);
    console.log(language);
    console.log(solutionCode);
    if (!languageId) {
      throw new ApiError(400, `${language} is not supported`)
    }
    const submission = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output
    }))
    const submissionResults = await submitBatch(submission);
    const tokens = submissionResults.map((res) => res.token);
    const results = await pollBatchResults(tokens);
    for (let i = 0; i < results.length; i++) {
      console.log("REsults -------", results)
      const result = results[i];
      console.log(
        `Testcase ${i + 1} and Languaage ${language} -------------result${JSON.stringify(result.status.description)}`
      );
      if (result.status.id !== 3) {
        return res.status(400).json({
          error: `Testcase ${i + 1} failed for language ${language}`
        });
      }
    }
  }
  const newProblem = await db.problem.create({
    data: {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
      userId: req.user.id
    }
  })
  return res.status(201).json({
    success: true,
    message: 'Message created successfully',
    problem: newProblem
  })
})

export const getAllProblems = asyncHandler(async (req, res, next) => {
  const problems = await db.problem.findMany();
  if (!problems) {
    throw new ApiError(404, "No problem found")
  }
  res.status(200).json(
    new ApiResponse(200, problems, "Message fetched successfully")
  )

})

export const getProblemsById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const problem = await db.problem.findUnique({
    where: {
      id
    }
  });
  if (!problem) {
    throw new ApiError(404, 'problem not found')
  }
  return res.status(200).json(
    new ApiResponse(200, problem, "Success")
  )
})

export const updateProblem = asyncHandler(async (req, res, next) => {

})

export const deleteProblem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const problem = await db.problem.findUnique({
    where: { id }
  });
  if (!problem) {
    throw new ApiError(404, "problem not found");
  }
  await db.problem.delete({ where: { id } });
  res.status(200).json(
    new ApiResponse(200, {}, 'Problem deleted successfully')
  )
})

export const getAllProblemsSolvedByUser = asyncHandler(async (req, res, next) => {
  const problems = await db.problem.findMany({
    where: {
      solvedBy: {
        some: {
          userId: req.user.id
        }
      }
    },
    include: {
      solvedBy: {
        where: {
          userId: req.user.id
        }
      }
    }
  });
  res.status(200).json(
    new ApiResponse(200, problems, 'Problems fetched successfully')
  )
})
