import { Router } from 'express';
import quizRoutes from './quiz.routes.js';

const router = Router();

router.use('/', quizRoutes);

export default router;
