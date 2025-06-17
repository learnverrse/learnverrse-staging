import { HTTPSTATUS } from '../../../configs/http.config.js';
import AsyncHandler from '../../../middlewares/asyncHandler.js';
import { getAllCoursesService } from '../services/getAllCourses.course.service.js';
import { getCourseByIdService } from '../services/getCourseById.service.js';

export const getAllCourses = AsyncHandler(async (req, res) => {
  const {
    courses,
    limitNum,
    hasPrevPage,
    hasNextPage,
    totalPages,
    pageNum,
    totalCourses,
  } = await getAllCoursesService(req);
  // Return response
  res.status(HTTPSTATUS.OK).json({
    success: true,
    count: courses.length,
    totalCourses,
    pagination: {
      currentPage: pageNum,
      totalPages,
      hasNextPage,
      hasPrevPage,
      limit: limitNum,
    },
    data: courses,
  });
});
export const getCourseById = AsyncHandler(async (req, res) => {
  const course = await getCourseByIdService(req);

  res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Course fetched successfully',
    data: course,
  });
});
