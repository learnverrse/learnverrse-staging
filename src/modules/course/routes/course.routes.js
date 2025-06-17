import express from 'express';
import {
  getAllCourses,
  getCourseById,
} from '../controllers/course.controller.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:courseId', getCourseById);

export default router;
