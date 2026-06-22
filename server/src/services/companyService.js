import Company from '../models/Company.js';
import Question from '../models/Question.js';
import UserProgress from '../models/UserProgress.js';
import ApiError from '../utils/ApiError.js';
import { slugify, paginateMeta } from '../utils/helpers.js';
import mongoose from 'mongoose';

const toObjectId = (id) => {
  if (!id) return null;
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
};

export const getAllCompanies = async ({ search, sort = 'name', page = 1, limit = 20, userId }) => {
  const filter = { isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  const sortMap = {
    name: { name: 1 },
    questions: { totalQuestions: -1 },
    newest: { createdAt: -1 },
  };

  const total = await Company.countDocuments(filter);
  const companies = await Company.find(filter)
    .sort(sortMap[sort] || sortMap.name)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  let progressMap = {};
  if (userId) {
    const userObjectId = toObjectId(userId);
    const progress = await UserProgress.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: '$company',
          solved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
          bookmarked: { $sum: { $cond: ['$isBookmarked', 1, 0] } },
          revision: { $sum: { $cond: ['$isRevision', 1, 0] } },
        },
      },
    ]);
    progressMap = Object.fromEntries(progress.map((p) => [p._id.toString(), p]));
  }

  const enriched = companies.map((c) => {
    const prog = progressMap[c._id.toString()] || { solved: 0, bookmarked: 0, revision: 0 };
    const progressPercent = c.totalQuestions > 0
      ? Math.round((prog.solved / c.totalQuestions) * 100)
      : 0;
    return { ...c, solvedCount: prog.solved, progressPercent };
  });

  return {
    companies: enriched,
    pagination: paginateMeta(total, page, limit),
  };
};

export const getCompanyBySlug = async (slug, userId) => {
  const company = await Company.findOne({ slug, isActive: true }).lean();
  if (!company) throw new ApiError(404, 'Company not found');

  let stats = { solved: 0, bookmarked: 0, revision: 0 };
  if (userId) {
    const userObjectId = toObjectId(userId);
    const progress = await UserProgress.aggregate([
      { $match: { user: userObjectId, company: company._id } },
      {
        $group: {
          _id: null,
          solved: { $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] } },
          bookmarked: { $sum: { $cond: ['$isBookmarked', 1, 0] } },
          revision: { $sum: { $cond: ['$isRevision', 1, 0] } },
        },
      },
    ]);
    if (progress[0]) stats = progress[0];
  }

  return {
    ...company,
    solvedCount: stats.solved,
    progressPercent: company.totalQuestions > 0
      ? Math.round((stats.solved / company.totalQuestions) * 100)
      : 0,
  };
};

export const createCompany = async (data) => {
  const slug = slugify(data.name);
  const existing = await Company.findOne({ $or: [{ name: data.name }, { slug }] });
  if (existing) throw new ApiError(400, 'Company already exists');

  return Company.create({ ...data, slug });
};

export const updateCompany = async (id, data) => {
  if (data.name) {
    data.slug = slugify(data.name);
  }
  const company = await Company.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!company) throw new ApiError(404, 'Company not found');
  return company;
};

export const deleteCompany = async (id) => {
  const company = await Company.findById(id);
  if (!company) throw new ApiError(404, 'Company not found');

  await Question.deleteMany({ company: id });
  await UserProgress.deleteMany({ company: id });
  await company.deleteOne();
  return { message: 'Company deleted' };
};

export const findOrCreateCompany = async (name) => {
  const slug = slugify(name);
  let company = await Company.findOne({ slug });
  if (!company) {
    company = await Company.create({ name, slug });
  }
  return company;
};

export const updateCompanyQuestionCount = async (companyId) => {
  const count = await Question.countDocuments({ company: companyId, isActive: true });
  await Company.findByIdAndUpdate(companyId, { totalQuestions: count });
  return count;
};
