import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ user: 1, question: 1 }, { unique: true });
noteSchema.index({ user: 1, updatedAt: -1 });

const Note = mongoose.model('Note', noteSchema);
export default Note;
