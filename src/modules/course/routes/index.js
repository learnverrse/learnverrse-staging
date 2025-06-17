import { Router } from 'express';

import publicRoutes from './course.routes.js';
import educatorRoutes from './course.educator.routes.js';
import passport from 'passport';

const router = Router();

router.use('/public', publicRoutes);
router.use(
  '/educator',
  passport.authenticate('jwt', { session: false }),
  educatorRoutes
);

export default router;
