import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { db } from "../libs/db.js";

export const getAllListDetails = asyncHandler(async (req, res) => {
  const playlists = await db.playlist.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlist fetched successfully"));
});

export const getPlaylistDetails = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const playlist = await db.playlist.findUnique({
    where: {
      id: playlistId,
      userId: req.user.id,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
    },
  });
  if (!playlist) {
    throw new ApiError(500, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;
  const playlist = await db.playlist.create({
    data: {
      name,
      description,
      userId,
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

export const addProblemToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;
  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, "Invalid or missing problems");
  }

  const problemsInPlaylist = await db.problemInPlaylist.createMany({
    data: problemIds.map((problemId) => ({
      playlistId,
      problemId,
    })),
  });
  res
    .status(201)
    .json(
      new ApiResponse(201, problemsInPlaylist, "Problems added to playist"),
    );
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const deletedPlaylist = await db.playlist.delete({
    where: {
      playlistId,
    },
  });
  if (!deletePlaylist) {
    throw new ApiError(400, "Playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

export const deleteProblemFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;
  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, "Invalid problem ids");
  }
  const deletedProblems = await db.problemInPlaylist.deleteMany({
    where: {
      playlistId,
      problemId: {
        in: problemIds,
      },
    },
  });
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Problems deleted successfully"));
});
