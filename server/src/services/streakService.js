import User from '../models/User.js';
import { getStartOfDay, getDaysDifference } from '../utils/helpers.js';

export const updateUserStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = getStartOfDay();
  const lastSolved = user.lastSolvedDate ? getStartOfDay(user.lastSolvedDate) : null;

  if (lastSolved && getDaysDifference(today, lastSolved) === 0) {
    return user;
  }

  if (lastSolved && getDaysDifference(today, lastSolved) === 1) {
    user.currentStreak += 1;
  } else {
    user.currentStreak = 1;
  }

  if (user.currentStreak > user.bestStreak) {
    user.bestStreak = user.currentStreak;
  }

  user.lastSolvedDate = today;
  user.solvedDates.push(today);

  await user.save();
  return user;
};

export const getStreakInfo = (user) => ({
  currentStreak: user.currentStreak || 0,
  bestStreak: user.bestStreak || 0,
  lastSolvedDate: user.lastSolvedDate,
});
