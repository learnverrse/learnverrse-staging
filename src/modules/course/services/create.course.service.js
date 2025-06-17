import CourseModel from '../model/course.model.js';
import { CourseStatusEnums } from '../../../enums/course-status.enum.js';
import { CourseSubscriptionEnum } from '../../../enums/course-subscription.enum.js';
import { CourseLevelEnum } from '../../../enums/course-level.enum.js';

export const createCourseService = async (req) => {
  try {
    const newCourse = new CourseModel({
      educatorId: req?.user._id,
      educatorName: req?.user.name || 'Unknown Educator',
      title: 'Untitled Course',
      description: 'about course',
      category: 'Uncategorized',
      price: 0,
      image: '',
      level: CourseLevelEnum.BEGINNER,
      subscription: CourseSubscriptionEnum.PAID,
      status: CourseStatusEnums.DRAFT,
      isApproved: false,
      isFeatured: false,
      sections: [],
      quiz: [],
    });

    await newCourse.save();

    return newCourse;
  } catch (error) {
    throw error;
  }
};
