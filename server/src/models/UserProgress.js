import mongoose from 'mongoose';
import { PROGRESS_STATUS } from '../config/constants.js';

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PROGRESS_STATUS),
      default: PROGRESS_STATUS.NOT_STARTED,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    isRevision: {
      type: Boolean,
      default: false,
    },
    solvedAt: {
      type: Date,
      default: null,
    },
    hasNotes: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userProgressSchema.index({ user: 1, question: 1 }, { unique: true });
userProgressSchema.index({ user: 1, status: 1 });
userProgressSchema.index({ user: 1, isBookmarked: 1 });
userProgressSchema.index({ user: 1, isRevision: 1 });
userProgressSchema.index({ user: 1, company: 1 });
userProgressSchema.index({ user: 1, solvedAt: -1 });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;
