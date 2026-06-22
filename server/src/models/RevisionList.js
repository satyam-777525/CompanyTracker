import mongoose from 'mongoose';

const revisionListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'My Revision List',
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    }],
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

revisionListSchema.index({ user: 1 });

const RevisionList = mongoose.model('RevisionList', revisionListSchema);
export default RevisionList;
