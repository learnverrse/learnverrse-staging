import CourseModel from '../model/course.model.js';

export const getAllCoursesService = async (req) => {
  const {
    category,
    search,
    ownCoursesOnly,
    isFeatured,
    page = 1,
    limit = 10,
  } = req.query;

  try {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filters = {};

    // Filter by category
    if (category) {
      filters.category = category;
    }

    // Search in title or description
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Only courses by the logged-in educator
    if (ownCoursesOnly === 'true') {
      filters.educatorId = req.user;
    }

    // Filter featured courses
    if (typeof isFeatured !== 'undefined') {
      filters.isFeatured = isFeatured === 'true';
    }

    const [courses, totalCourses] = await Promise.all([
      CourseModel.find(filters)
        .sort({ createdAt: -1 })
        .select(
          'title description category price level status createdAt educatorName'
        )
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CourseModel.countDocuments(filters), //count the documents
    ]);

    const totalPages = Math.ceil(totalCourses / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      courses,
      limitNum,
      hasPrevPage,
      hasNextPage,
      pageNum,
      totalCourses,
    };
  } catch (error) {
    throw error;
  }
};
