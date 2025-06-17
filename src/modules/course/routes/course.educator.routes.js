import express from 'express';
import {
  createCourse,
  deleteCourse,
  getUploadVideoUrl,
  updateCourse,
  viewAllCourses,
} from '../controllers/course.educator.controller.js';
const router = express.Router();

router.get('/', viewAllCourses);

router.post('/', createCourse);

router.put('/:courseId', updateCourse);

router.delete('/:courseId', deleteCourse);

router.post(
  '/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url',
  getUploadVideoUrl
);

export default router;
