import * as noteService from '../services/noteService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getNote = asyncHandler(async (req, res) => {
  const note = await noteService.getNote(req.user._id, req.params.questionId);
  res.json({ success: true, data: note });
});

export const upsertNote = asyncHandler(async (req, res) => {
  const note = await noteService.upsertNote(req.user._id, req.params.questionId, req.body.content);
  res.json({ success: true, data: note });
});

export const deleteNote = asyncHandler(async (req, res) => {
  const result = await noteService.deleteNote(req.user._id, req.params.questionId);
  res.json({ success: true, data: result });
});

export const getAllNotes = asyncHandler(async (req, res) => {
  const result = await noteService.getAllUserNotes(req.user._id, {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
  });
  res.json({ success: true, data: result });
});
