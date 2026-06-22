import Question from '../models/Question.js';
import UserProgress from '../models/UserProgress.js';
import Company from '../models/Company.js';
import ApiError from '../utils/ApiError.js';
import { slugify, paginateMeta } from '../utils/helpers.js';
import { updateCompanyQuestionCount } from './companyService.js';
import mongoose from 'mongoose';

const toObjectId = (id) => {
  if (!id) return null;
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
};

export const getQuestions = async ({
  companyId,
  companySlug,
  search,
  difficulty,
  status,
  curatedList,
  page = 1,
  limit = 20,
  sort = 'questionNumber',
  userId,
}) => {
  const filter = { isActive: true };
  let resolvedCompanyId = companyId ? toObjectId(companyId) : null;

  if (companySlug) {
    const company = await Company.findOne({ slug: companySlug });
    if (!company) throw new ApiError(404, 'Company not found');
    resolvedCompanyId = company._id;
  }

  if (resolvedCompanyId) filter.company = resolvedCompanyId;
  if (difficulty) filter.difficulty = difficulty;
  if (curatedList) filter.curatedLists = curatedList;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap = {
    questionNumber: { questionNumber: 1 },
    title: { title: 1 },
    difficulty: { difficulty: 1 },
    acceptance: { acceptanceRate: -1 },
    frequency: { frequencyRate: -1 },
  };

  if (status) {
    if (!userId) {
      return {
        questions: [],
        pagination: paginateMeta(0, page, limit),
      };
    }

    const userObjectId = toObjectId(userId);
    const progressQuery = { user: userObjectId };
    if (resolvedCompanyId) progressQuery.company = resolvedCompanyId;

    if (status === 'solved') {
      progressQuery.status = 'solved';
      const progressRecords = await UserProgress.find(progressQuery).select('question');
      const questionIds = progressRecords.map((p) => p.question);
      filter._id = questionIds.length > 0 ? { $in: questionIds } : { $in: [null] };
    } else if (status === 'unsolved') {
      const solvedRecords = await UserProgress.find({ ...progressQuery, status: 'solved' }).select('question');
      const solvedIds = solvedRecords.map((p) => p.question);
      if (solvedIds.length > 0) filter._id = { $nin: solvedIds };
    } else if (status === 'revision') {
      progressQuery.isRevision = true;
      const progressRecords = await UserProgress.find(progressQuery).select('question');
      const questionIds = progressRecords.map((p) => p.question);
      filter._id = questionIds.length > 0 ? { $in: questionIds } : { $in: [null] };
    } else if (status === 'bookmarked') {
      progressQuery.isBookmarked = true;
      const progressRecords = await UserProgress.find(progressQuery).select('question');
      const questionIds = progressRecords.map((p) => p.question);
      filter._id = questionIds.length > 0 ? { $in: questionIds } : { $in: [null] };
    }
  }

  const total = await Question.countDocuments(filter);
  const questions = await Question.find(filter)
    .populate('company', 'name slug logo')
    .sort(sortMap[sort] || sortMap.questionNumber)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  let progressMap = {};
  if (userId && questions.length > 0) {
    const qIds = questions.map((q) => q._id);
    const progress = await UserProgress.find({
      user: userId,
      question: { $in: qIds },
    }).lean();
    progressMap = Object.fromEntries(progress.map((p) => [p.question.toString(), p]));
  }

  const enriched = questions.map((q) => ({
    ...q,
    progress: progressMap[q._id.toString()] || {
      status: 'not_started',
      isBookmarked: false,
      isRevision: false,
    },
  }));

  return {
    questions: enriched,
    pagination: paginateMeta(total, page, limit),
  };
};

export const getQuestionById = async (id, userId) => {
  const question = await Question.findById(id)
    .populate('company', 'name slug logo')
    .lean();
  if (!question) throw new ApiError(404, 'Question not found');

  let progress = null;
  if (userId) {
    progress = await UserProgress.findOne({ user: userId, question: id }).lean();
  }

  return {
    ...question,
    progress: progress || {
      status: 'not_started',
      isBookmarked: false,
      isRevision: false,
    },
  };
};

export const createQuestion = async (data) => {
  const slug = slugify(data.title);
  const question = await Question.create({ ...data, slug });
  await updateCompanyQuestionCount(data.company);
  return question;
};

export const updateQuestion = async (id, data) => {
  if (data.title) data.slug = slugify(data.title);
  const question = await Question.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!question) throw new ApiError(404, 'Question not found');
  await updateCompanyQuestionCount(question.company);
  return question;
};

export const deleteQuestion = async (id) => {
  const question = await Question.findById(id);
  if (!question) throw new ApiError(404, 'Question not found');
  const companyId = question.company;
  await question.deleteOne();
  await UserProgress.deleteMany({ question: id });
  await updateCompanyQuestionCount(companyId);
  return { message: 'Question deleted' };
};

export const globalSearch = async ({ q, page = 1, limit = 20, userId }) => {
  const filter = {
    isActive: true,
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
      { difficulty: { $regex: q, $options: 'i' } },
    ],
  };

  const companies = await Company.find({
    name: { $regex: q, $options: 'i' },
    isActive: true,
  }).select('_id');

  if (companies.length > 0) {
    filter.$or.push({ company: { $in: companies.map((c) => c._id) } });
  }

  const total = await Question.countDocuments(filter);
  const questions = await Question.find(filter)
    .populate('company', 'name slug logo')
    .sort({ frequencyRate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  let progressMap = {};
  if (userId && questions.length > 0) {
    const progress = await UserProgress.find({
      user: userId,
      question: { $in: questions.map((q) => q._id) },
    }).lean();
    progressMap = Object.fromEntries(progress.map((p) => [p.question.toString(), p]));
  }

  return {
    questions: questions.map((q) => ({
      ...q,
      progress: progressMap[q._id.toString()] || { status: 'not_started' },
    })),
    pagination: paginateMeta(total, page, limit),
  };
};
