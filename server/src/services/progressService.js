import UserProgress from '../models/UserProgress.js';
import Question from '../models/Question.js';
import Note from '../models/Note.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import ApiError from '../utils/ApiError.js';
import { PROGRESS_STATUS } from '../config/constants.js';
import { updateUserStreak } from './streakService.js';
import { paginateMeta } from '../utils/helpers.js';

export const updateProgress = async (userId, questionId, updates) => {
  const question = await Question.findById(questionId);
  if (!question) throw new ApiError(404, 'Question not found');

  const wasSolved = await UserProgress.findOne({
    user: userId,
    question: questionId,
    status: PROGRESS_STATUS.SOLVED,
  });

  const progressData = {
    user: userId,
    question: questionId,
    company: question.company,
    ...updates,
  };

  if (updates.status === PROGRESS_STATUS.SOLVED) {
    progressData.solvedAt = new Date();
    progressData.isRevision = false;
  }

  const progress = await UserProgress.findOneAndUpdate(
    { user: userId, question: questionId },
    progressData,
    { new: true, upsert: true, runValidators: true }
  );

  if (updates.status === PROGRESS_STATUS.SOLVED && !wasSolved) {
    await updateUserStreak(userId);
  }

  return progress;
};

export const getUserDashboard = async (userId) => {
  const [
    totalQuestions,
    solvedCount,
    bookmarkedCount,
    revisionCount,
    notesCount,
    user,
    difficultyStats,
    weeklyProgress,
    monthlyProgress,
    companyProgress,
  ] = await Promise.all([
    Question.countDocuments({ isActive: true }),
    UserProgress.countDocuments({ user: userId, status: PROGRESS_STATUS.SOLVED }),
    UserProgress.countDocuments({ user: userId, isBookmarked: true }),
    UserProgress.countDocuments({ user: userId, isRevision: true }),
    Note.countDocuments({ user: userId, content: { $ne: '' } }),
    User.findById(userId).select('currentStreak bestStreak name'),
    getDifficultyStats(userId),
    getWeeklyProgress(userId),
    getMonthlyProgress(userId),
    getCompanyProgress(userId),
  ]);

  const remaining = totalQuestions - solvedCount;
  const completionPercent = totalQuestions > 0
    ? Math.round((solvedCount / totalQuestions) * 100)
    : 0;

  const readinessScore = calculateReadinessScore({
    solvedCount,
    totalQuestions,
    currentStreak: user?.currentStreak || 0,
    revisionCount,
  });

  return {
    stats: {
      totalQuestions,
      solvedCount,
      remaining,
      bookmarkedCount,
      revisionCount,
      notesCount,
      currentStreak: user?.currentStreak || 0,
      bestStreak: user?.bestStreak || 0,
      completionPercent,
      readinessScore,
    },
    charts: {
      difficultyStats,
      weeklyProgress,
      monthlyProgress,
      companyProgress,
    },
    insights: generateInsights({
      solvedCount,
      remaining,
      currentStreak: user?.currentStreak || 0,
      completionPercent,
    }),
  };
};

const getDifficultyStats = async (userId) => {
  const solved = await UserProgress.find({
    user: userId,
    status: PROGRESS_STATUS.SOLVED,
  }).populate('question', 'difficulty');

  const stats = { Easy: 0, Medium: 0, Hard: 0 };
  solved.forEach((p) => {
    if (p.question?.difficulty) {
      stats[p.question.difficulty]++;
    }
  });
  return Object.entries(stats).map(([name, value]) => ({ name, value }));
};

const getWeeklyProgress = async (userId) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const count = await UserProgress.countDocuments({
      user: userId,
      status: PROGRESS_STATUS.SOLVED,
      solvedAt: { $gte: date, $lt: nextDay },
    });

    days.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: count,
    });
  }
  return days;
};

const getMonthlyProgress = async (userId) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    const count = await UserProgress.countDocuments({
      user: userId,
      status: PROGRESS_STATUS.SOLVED,
      solvedAt: { $gte: start, $lt: end },
    });

    months.push({
      name: start.toLocaleDateString('en-US', { month: 'short' }),
      value: count,
    });
  }
  return months;
};

const getCompanyProgress = async (userId) => {
  const progress = await UserProgress.aggregate([
    { $match: { user: userId, status: PROGRESS_STATUS.SOLVED } },
    { $group: { _id: '$company', solved: { $sum: 1 } } },
    { $sort: { solved: -1 } },
    { $limit: 8 },
    {
      $lookup: {
        from: 'companies',
        localField: '_id',
        foreignField: '_id',
        as: 'company',
      },
    },
    { $unwind: '$company' },
  ]);

  return progress.map((p) => ({
    name: p.company.name,
    solved: p.solved,
    total: p.company.totalQuestions,
    percent: p.company.totalQuestions > 0
      ? Math.round((p.solved / p.company.totalQuestions) * 100)
      : 0,
  }));
};

const calculateReadinessScore = ({ solvedCount, totalQuestions, currentStreak, revisionCount }) => {
  const solveScore = totalQuestions > 0 ? (solvedCount / totalQuestions) * 60 : 0;
  const streakScore = Math.min(currentStreak * 2, 20);
  const revisionPenalty = Math.min(revisionCount * 0.5, 10);
  return Math.round(Math.min(solveScore + streakScore - revisionPenalty + 20, 100));
};

const generateInsights = ({ solvedCount, remaining, currentStreak, completionPercent }) => {
  const insights = [];
  if (currentStreak >= 7) {
    insights.push({ type: 'success', text: `Amazing! You're on a ${currentStreak}-day streak! Keep it up!` });
  } else if (currentStreak > 0) {
    insights.push({ type: 'info', text: `${currentStreak}-day streak! Solve one more today to keep it going.` });
  }
  if (completionPercent >= 50) {
    insights.push({ type: 'success', text: `You've completed ${completionPercent}% of all questions. Great progress!` });
  } else if (solvedCount > 0) {
    insights.push({ type: 'info', text: `${remaining} questions remaining. Focus on high-frequency problems.` });
  } else {
    insights.push({ type: 'warning', text: 'Start your journey today! Solve your first question to begin tracking.' });
  }
  return insights;
};

export const getBookmarks = async (userId, { page = 1, limit = 20 }) => {
  const filter = { user: userId, isBookmarked: true };
  const total = await UserProgress.countDocuments(filter);
  const bookmarks = await UserProgress.find(filter)
    .populate({
      path: 'question',
      populate: { path: 'company', select: 'name slug logo' },
    })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    bookmarks: bookmarks.map((b) => ({
      ...b.question.toObject(),
      progress: {
        status: b.status,
        isBookmarked: b.isBookmarked,
        isRevision: b.isRevision,
        solvedAt: b.solvedAt,
      },
    })),
    pagination: paginateMeta(total, page, limit),
  };
};

export const getRevisions = async (userId, { page = 1, limit = 20 }) => {
  const filter = { user: userId, isRevision: true };
  const total = await UserProgress.countDocuments(filter);
  const revisions = await UserProgress.find(filter)
    .populate({
      path: 'question',
      populate: { path: 'company', select: 'name slug logo' },
    })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    revisions: revisions.map((r) => ({
      ...r.question.toObject(),
      progress: {
        status: r.status,
        isBookmarked: r.isBookmarked,
        isRevision: r.isRevision,
        solvedAt: r.solvedAt,
      },
    })),
    pagination: paginateMeta(total, page, limit),
  };
};

export const getStudyCalendar = async (userId, year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const solved = await UserProgress.find({
    user: userId,
    status: PROGRESS_STATUS.SOLVED,
    solvedAt: { $gte: start, $lt: end },
  }).select('solvedAt');

  const calendar = {};
  solved.forEach((s) => {
    const day = s.solvedAt.toISOString().split('T')[0];
    calendar[day] = (calendar[day] || 0) + 1;
  });

  return calendar;
};

export const exportProgressData = async (userId) => {
  const progress = await UserProgress.find({ user: userId })
    .populate({
      path: 'question',
      select: 'title difficulty url questionNumber',
      populate: { path: 'company', select: 'name' },
    })
    .sort({ updatedAt: -1 });

  const user = await User.findById(userId).select('name email currentStreak bestStreak createdAt');

  return {
    user,
    progress: progress.map((p) => ({
      question: p.question?.title,
      company: p.question?.company?.name,
      difficulty: p.question?.difficulty,
      status: p.status,
      isBookmarked: p.isBookmarked,
      isRevision: p.isRevision,
      solvedAt: p.solvedAt,
    })),
    exportedAt: new Date(),
  };
};
