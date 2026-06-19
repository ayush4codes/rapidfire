import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: 'Each question must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  category: {
    type: String,
    default: 'tech',
  },
  timeLimit: {
    type: Number,
    default: 15, // Default 15 seconds
  },
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
