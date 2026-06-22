import * as progressService from '../services/progressService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await progressService.getUserDashboard(req.user._id);
  res.json({ success: true, data });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const progress = await progressService.updateProgress(
    req.user._id,
    req.params.questionId,
    req.body
  );
  res.json({ success: true, data: progress });
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const result = await progressService.getBookmarks(req.user._id, {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  });
  res.json({ success: true, data: result });
});

export const getRevisions = asyncHandler(async (req, res) => {
  const result = await progressService.getRevisions(req.user._id, {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  });
  res.json({ success: true, data: result });
});

export const getStudyCalendar = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const calendar = await progressService.getStudyCalendar(
    req.user._id,
    parseInt(year) || new Date().getFullYear(),
    parseInt(month) || new Date().getMonth() + 1
  );
  res.json({ success: true, data: calendar });
});

export const exportProgress = asyncHandler(async (req, res) => {
  const data = await progressService.exportProgressData(req.user._id);
  res.json({ success: true, data });
});
