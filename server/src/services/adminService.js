import User from '../models/User.js';
import Question from '../models/Question.js';
import Company from '../models/Company.js';
import UserProgress from '../models/UserProgress.js';
import { PROGRESS_STATUS } from '../config/constants.js';

export const getAdminDashboard = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalUsers,
    totalQuestions,
    totalCompanies,
    dailyActiveUsers,
    mostSolvedCompany,
    mostBookmarked,
    mostActiveUsers,
    userGrowth,
    questionsByDifficulty,
  ] = await Promise.all([
    User.countDocuments(),
    Question.countDocuments({ isActive: true }),
    Company.countDocuments({ isActive: true }),
    UserProgress.distinct('user', { updatedAt: { $gte: today } }).then((u) => u.length),
    getMostSolvedCompany(),
    getMostBookmarkedQuestion(),
    getMostActiveUsers(),
    getUserGrowth(),
    getQuestionsByDifficulty(),
  ]);

  return {
    stats: {
      totalUsers,
      totalQuestions,
      totalCompanies,
      dailyActiveUsers,
      mostSolvedCompany,
      mostBookmarked,
    },
    mostActiveUsers,
    charts: {
      userGrowth,
      questionsByDifficulty,
    },
  };
};

const getMostSolvedCompany = async () => {
  const result = await UserProgress.aggregate([
    { $match: { status: PROGRESS_STATUS.SOLVED } },
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
    { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
    { $unwind: '$company' },
  ]);
  return result[0] ? { name: result[0].company.name, count: result[0].count } : null;
};

const getMostBookmarkedQuestion = async () => {
  const result = await UserProgress.aggregate([
    { $match: { isBookmarked: true } },
    { $group: { _id: '$question', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
    { $lookup: { from: 'questions', localField: '_id', foreignField: '_id', as: 'question' } },
    { $unwind: '$question' },
  ]);
  return result[0] ? { title: result[0].question.title, count: result[0].count } : null;
};

const getMostActiveUsers = async () => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return UserProgress.aggregate([
    { $match: { status: PROGRESS_STATUS.SOLVED, solvedAt: { $gte: weekAgo } } },
    { $group: { _id: '$user', solved: { $sum: 1 } } },
    { $sort: { solved: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        avatar: '$user.avatar',
        currentStreak: '$user.currentStreak',
        solved: 1,
      },
    },
  ]);
};

const getUserGrowth = async () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });
    months.push({
      name: start.toLocaleDateString('en-US', { month: 'short' }),
      value: count,
    });
  }
  return months;
};

const getQuestionsByDifficulty = async () => {
  const result = await Question.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  ]);
  return result.map((r) => ({ name: r._id, value: r.count }));
};

export const getLeaderboard = async (period = 'alltime') => {
  let dateFilter = {};
  const now = new Date();

  if (period === 'weekly') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { solvedAt: { $gte: weekAgo } };
  } else if (period === 'monthly') {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { solvedAt: { $gte: monthAgo } };
  }

  if (period === 'alltime') {
    const users = await User.find({ role: 'user' })
      .select('name avatar currentStreak bestStreak')
      .sort({ currentStreak: -1 })
      .limit(50)
      .lean();

    const solvedCounts = await UserProgress.aggregate([
      { $match: { status: PROGRESS_STATUS.SOLVED } },
      { $group: { _id: '$user', solved: { $sum: 1 } } },
    ]);

    const solvedMap = Object.fromEntries(solvedCounts.map((s) => [s._id.toString(), s.solved]));

    return users
      .map((u) => ({
        ...u,
        solved: solvedMap[u._id.toString()] || 0,
      }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 50);
  }

  return UserProgress.aggregate([
    { $match: { status: PROGRESS_STATUS.SOLVED, ...dateFilter } },
    { $group: { _id: '$user', solved: { $sum: 1 } } },
    { $sort: { solved: -1 } },
    { $limit: 50 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        avatar: '$user.avatar',
        currentStreak: '$user.currentStreak',
        solved: 1,
      },
    },
  ]);
};

export const getPlatformStats = async () => {
  const [users, questions, companies, solved] = await Promise.all([
    User.countDocuments(),
    Question.countDocuments({ isActive: true }),
    Company.countDocuments({ isActive: true }),
    UserProgress.countDocuments({ status: PROGRESS_STATUS.SOLVED }),
  ]);

  return { users, questions, companies, solved };
};
