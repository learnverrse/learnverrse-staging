import mongoose, { Schema } from 'mongoose';

// Schema for each option in a multiple-choice question
const optionSchema = new Schema({
  id: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  isCorrect: { 
    type: Boolean, 
    required: true,
    select: false // Ensure this is not returned to the client by default
  }
});

// Schema for a quiz question
const questionSchema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  options: [optionSchema],
  explanation: {
    type: String,
    select: false // Explanation is not returned to the client by default
  }
});

// Main quiz schema
const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
      trim: true,
    },
    // Link to a specific section and chapter
    sectionId: {
      type: String,
      required: true,
      trim: true,
    },
    chapterId: {
      type: String,
      required: true,
      trim: true,
    },
    // This is the ID that will be referenced in the course model's quizSchema
    quizId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    timeLimit: {
      type: Number, // Time limit in minutes
      default: 30
    },
    passingScore: {
      type: Number, // Percentage required to pass
      default: 70
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true
    },
    // This will allow tracking who created the quiz
    createdBy: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Method to get quiz without answers for user consumption
quizSchema.methods.omitAnswers = function () {
  const quizObject = this.toObject();
  
  // Remove isCorrect from all options in all questions
  if (quizObject.questions && Array.isArray(quizObject.questions) && quizObject.questions.length > 0) {
    quizObject.questions.forEach(question => {
      if (question.options && Array.isArray(question.options) && question.options.length > 0) {
        question.options.forEach(option => {
          delete option.isCorrect;
        });
      }
      // Also remove explanation
      delete question.explanation;
    });
  }
  
  return quizObject;
};

// Static method to get a quiz by ID without answers
quizSchema.statics.findByIdWithoutAnswers = async function (id) {
  const quiz = await this.findById(id);
  if (!quiz) return null;
  return quiz.omitAnswers();
};

// Helper function to process lean documents that don't have methods
quizSchema.statics.omitAnswersFromLeanDocument = function(quizObj) {
  if (!quizObj) return null;
  
  const processedQuiz = { ...quizObj };
  
  // Remove isCorrect from all options in all questions
  if (processedQuiz.questions && Array.isArray(processedQuiz.questions) && processedQuiz.questions.length > 0) {
    processedQuiz.questions.forEach(question => {
      if (question.options && Array.isArray(question.options) && question.options.length > 0) {
        question.options.forEach(option => {
          delete option.isCorrect;
        });
      }
      // Also remove explanation
      delete question.explanation;
    });
  }
  
  return processedQuiz;
};

const QuizModel = mongoose.model('Quiz', quizSchema);
export default QuizModel;
