import CourseModel from '../model/course.model.js';
import {
  NotFoundException,
  UnauthorizedException,
} from '../../../utils/appError.js';

export const deleteCourseService = async (courseId, educatorId) => {
  try {
    const course = await CourseModel.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course does not exist');
    }

    if (course.educatorId.toString() !== educatorId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to delete this course'
      );
    }

    await course.deleteOne();

    return { message: 'Course deleted successfully' };
  } catch (error) {
    throw error;
  }
};
