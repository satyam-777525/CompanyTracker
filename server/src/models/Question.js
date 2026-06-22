import mongoose from 'mongoose';
import { DIFFICULTIES, CURATED_LISTS } from '../config/constants.js';

const questionSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    url: {
      type: String,
      required: [true, 'LeetCode URL is required'],
    },
    difficulty: {
      type: String,
      enum: DIFFICULTIES,
      required: true,
    },
    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    frequencyRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    curatedLists: [{
      type: String,
      enum: Object.values(CURATED_LISTS),
    }],
    leetcodeId: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

questionSchema.index({ company: 1, questionNumber: 1 }, { unique: true });
questionSchema.index({ company: 1, slug: 1 }, { unique: true });
questionSchema.index({ title: 'text', tags: 'text' });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ company: 1, difficulty: 1 });
questionSchema.index({ curatedLists: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
