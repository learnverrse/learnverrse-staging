import { HTTPSTATUS } from '../../../configs/http.config.js';
import AsyncHandler from '../../../middlewares/asyncHandler.js';
import QuizModel from '../model/quiz.model.js';
import CourseModel from '../../course/model/course.model.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all quizzes for a course
 */
export const getQuizzesByCourse = AsyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  const quizzes = await QuizModel.find({ courseId })
    .select('quizId sectionId chapterId title description timeLimit passingScore isActive createdAt')
    .lean();
  
  // Since we're using lean(), we need to process the questions array safely if it exists
  const processedQuizzes = Array.isArray(quizzes) ? quizzes.map(quiz => 
    quiz.questions ? QuizModel.omitAnswersFromLeanDocument(quiz) : quiz
  ) : [];
  
  res.status(HTTPSTATUS.OK).json({
    success: true,
    count: processedQuizzes.length,
    data: processedQuizzes,
  });
});

/**
 * Get all quizzes for a chapter
 */
export const getQuizzesByChapter = AsyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  
  const quizzes = await QuizModel.find({ chapterId })
    .select('quizId title description timeLimit passingScore isActive createdAt')
    .lean();
  
  // Since we're using lean(), we need to process the questions array safely if it exists
  const processedQuizzes = Array.isArray(quizzes) ? quizzes.map(quiz => 
    quiz.questions ? QuizModel.omitAnswersFromLeanDocument(quiz) : quiz
  ) : [];
  
  res.status(HTTPSTATUS.OK).json({
    success: true,
    count: processedQuizzes.length,
    data: processedQuizzes,
  });
});

/**
 * Get a single quiz without answers
 */
export const getQuizById = AsyncHandler(async (req, res) => {
  const { quizId } = req.params;
  
  const quiz = await QuizModel.findOne({ quizId });
  
  if (!quiz) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found',
    });
    return;
  }
  
  // Use the custom method to omit answers
  const quizWithoutAnswers = quiz.omitAnswers();
  
  res.status(HTTPSTATUS.OK).json({
    success: true,
    data: quizWithoutAnswers,
  });
});

/**
 * Create a new quiz
 */
export const createQuiz = AsyncHandler(async (req, res) => {
  const { courseId, sectionId, chapterId, title, description, timeLimit, passingScore, questions } = req.body;
  
  // Verify the course, section, and chapter exist
  const course = await CourseModel.findById(courseId);
  if (!course) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success: false,
      message: 'Course not found',
    });
    return;
  }
  
  // Find the specific section and chapter
  const section = course.sections.find(s => s.sectionId === sectionId);
  if (!section) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success: false,
      message: 'Section not found in this course',
    });
    return;
  }
  
  const chapter = section.chapters.find(c => c.chapterId === chapterId);
  if (!chapter) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success: false,
      message: 'Chapter not found in this section',
    });
    return;
  }
  
  // Verify the chapter is of type 'Quiz' or 'QUIZ'
  if (chapter.type !== 'Quiz' && chapter.type !== 'QUIZ') {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: 'The specified chapter is not of type Quiz',
    });
    return;
  }
  
  // Generate a unique quizId
  const quizId = uuidv4();
  
  // Ensure questions is an array
  if (!Array.isArray(questions)) {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: 'Questions must be an array',
    });
    return;
  }
  
  // Format questions with IDs
  const formattedQuestions = questions.map(question => ({
    questionId: uuidv4(),
    text: question.text,
    explanation: question.explanation,
    options: question.options.map(option => ({
      id: uuidv4(),
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  }));
  
  const quiz = await QuizModel.create({
    quizId,
    courseId,
    sectionId,
    chapterId,
    title,
    description,
    timeLimit,
    passingScore,
    questions: formattedQuestions,
    isActive: true,
    createdBy: req.user.id,
  });
  
  const courseToUpdate = await CourseModel.findById(courseId);
  
  // Initialize quiz array if it doesn't exist
  if (!courseToUpdate.quiz) {
    courseToUpdate.quiz = [];
  }
  
  // Push the new quiz reference
  if (Array.isArray(courseToUpdate.quiz)) {
    courseToUpdate.quiz.push({
      quizId: quizId,
      question: title,
      text: description
    });
  }
  
  // Find the section and chapter
  const sectionToUpdate = courseToUpdate.sections.find(s => s.sectionId === sectionId);
  if (sectionToUpdate) {
    const chapterToUpdate = sectionToUpdate.chapters.find(c => c.chapterId === chapterId);
    if (chapterToUpdate) {
      // Update the quiz reference
      chapterToUpdate.quizReference = quizId;
      // Save the updated course
      await courseToUpdate.save();
    }
  }
  
  // Return created quiz without answers
  const safeQuiz = quiz.omitAnswers();
  
  res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Quiz created successfully',
    data: safeQuiz,
  });
});

/**
 * Update a quiz
 */
export const updateQuiz = AsyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { title, description, timeLimit, passingScore, questions, isActive } = req.body;
  
  // Find the quiz by quizId (not MongoDB _id)
  const quiz = await QuizModel.findOne({ quizId });
  
  if (!quiz) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found',
    });
    return;
  }
  
  // Only allow the creator to update the quiz
  if (quiz.createdBy.toString() !== req.user.id.toString()) {
    res.status(HTTPSTATUS.FORBIDDEN).json({
      success: false,
      message: 'You are not authorized to update this quiz',
    });
    return;
  }
  
  // Update fields if provided
  if (title) quiz.title = title;
  if (description) quiz.description = description;
  if (timeLimit) quiz.timeLimit = timeLimit;
  if (passingScore) quiz.passingScore = passingScore;
  if (typeof isActive === 'boolean') quiz.isActive = isActive;
  
  // Update questions if provided
  if (questions && Array.isArray(questions) && questions.length > 0) {
    const formattedQuestions = questions.map(question => ({
      questionId: question.questionId || uuidv4(),
      text: question.text,
      explanation: question.explanation,
      options: question.options.map(option => ({
        id: option.id || uuidv4(),
        text: option.text,
        isCorrect: option.isCorrect,
      })),
    }));
    
    quiz.questions = formattedQuestions;
  }
  
  await quiz.save();
  
  if (title || description) {
    // Find the course containing this quiz
    const courseToUpdate = await CourseModel.findOne({ 'quiz.quizId': quizId });
    
    if (courseToUpdate && courseToUpdate.quiz && Array.isArray(courseToUpdate.quiz)) {
      // Find and update the quiz reference
      const quizRef = courseToUpdate.quiz.find(q => q.quizId === quizId);
      if (quizRef) {
        if (title) quizRef.question = title;
        if (description) quizRef.text = description;
        
        // Save the updated course
        await courseToUpdate.save();
      }
    }
  }
  
  // Return updated quiz without answers
  const safeQuiz = quiz.omitAnswers();
  
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Quiz updated successfully',
    data: safeQuiz,
  });
});

/**
 * Delete a quiz
 */
export const deleteQuiz = AsyncHandler(async (req, res) => {
  const { quizId } = req.params;
  
  const quiz = await QuizModel.findOne({ quizId });
  
  if (!quiz) {
    res.status(HTTPSTATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found',
    });
    return;
  }
  
  // Only allow the creator to delete the quiz
  if (quiz.createdBy.toString() !== req.user.id.toString()) {
    res.status(HTTPSTATUS.FORBIDDEN).json({
      success: false,
      message: 'You are not authorized to delete this quiz',
    });
    return;
  }
  
  // Get quiz details before deletion for course update
  const { courseId, quizId: qId } = quiz;
  
  // Remove the quiz document
  await QuizModel.deleteOne({ quizId });
  
  // Also remove the quiz reference from the course using JavaScript approach
  const courseToUpdate = await CourseModel.findById(courseId);
  
  // Remove the quiz from the quiz array if it exists
  if (courseToUpdate.quiz && Array.isArray(courseToUpdate.quiz)) {
    courseToUpdate.quiz = courseToUpdate.quiz.filter(q => q.quizId !== quizId);
  }
  
  // Find and remove the quiz reference from the chapter
  for (const section of courseToUpdate.sections || []) {
    for (const chapter of section.chapters || []) {
      if (chapter.quizReference === quizId) {
        chapter.quizReference = null; // Or any default value that makes sense
      }
    }
  }
  
  // Save the updated course
  await courseToUpdate.save();
  
  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Quiz deleted successfully',
  });
});
