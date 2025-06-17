import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route.js';
import courseRoutes from '../modules/course/routes/index.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);

export default router;
