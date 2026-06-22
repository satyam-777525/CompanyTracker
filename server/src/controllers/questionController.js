import * as questionService from '../services/questionService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getQuestions = asyncHandler(async (req, res) => {
  const result = await questionService.getQuestions({
    companyId: req.query.companyId,
    companySlug: req.params.slug || req.query.companySlug,
    search: req.query.search,
    difficulty: req.query.difficulty,
    status: req.query.status,
    curatedList: req.query.curatedList,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sort: req.query.sort,
    userId: req.user?._id,
  });
  res.json({ success: true, data: result });
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id, req.user?._id);
  res.json({ success: true, data: question });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.body);
  res.status(201).json({ success: true, data: question });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.body);
  res.json({ success: true, data: question });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const result = await questionService.deleteQuestion(req.params.id);
  res.json({ success: true, data: result });
});

export const globalSearch = asyncHandler(async (req, res) => {
  const result = await questionService.globalSearch({
    q: req.query.q,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    userId: req.user?._id,
  });
  res.json({ success: true, data: result });
});
