import Note from '../models/Note.js';
import UserProgress from '../models/UserProgress.js';
import Question from '../models/Question.js';
import ApiError from '../utils/ApiError.js';

export const getNote = async (userId, questionId) => {
  const note = await Note.findOne({ user: userId, question: questionId });
  return note || { content: '' };
};

export const upsertNote = async (userId, questionId, content) => {
  const question = await Question.findById(questionId);
  if (!question) throw new ApiError(404, 'Question not found');

  const note = await Note.findOneAndUpdate(
    { user: userId, question: questionId },
    { content },
    { new: true, upsert: true }
  );

  await UserProgress.findOneAndUpdate(
    { user: userId, question: questionId },
    {
      user: userId,
      question: questionId,
      company: question.company,
      hasNotes: content.length > 0,
    },
    { upsert: true }
  );

  return note;
};

export const deleteNote = async (userId, questionId) => {
  const note = await Note.findOneAndDelete({ user: userId, question: questionId });
  if (!note) throw new ApiError(404, 'Note not found');

  await UserProgress.findOneAndUpdate(
    { user: userId, question: questionId },
    { hasNotes: false }
  );

  return { message: 'Note deleted' };
};

export const getAllUserNotes = async (userId, { page = 1, limit = 20 }) => {
  const total = await Note.countDocuments({ user: userId, content: { $ne: '' } });
  const notes = await Note.find({ user: userId, content: { $ne: '' } })
    .populate({
      path: 'question',
      populate: { path: 'company', select: 'name slug' },
    })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { notes, total, page, limit };
};
