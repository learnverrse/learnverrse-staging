import express from 'express';
import { HTTPSTATUS } from '../../configs/http.config.js';
import {
  forgotPasswordController,
  loginUserController,
  logoutController,
  refreshTokenController,
  registerUserController,
  setPasswordController,
  verifyForgotPasswordController,
  verifyRegisterController,
} from './auth.controller.js';
import passport, { Passport } from 'passport';

const router = express.Router();
router.get(
  '/me',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.status(HTTPSTATUS.OK).json({
      success: true,
      data: req.user,
    });
  }
);
router.post('/register', registerUserController);
router.post('/verify-registration', verifyRegisterController);
router.post('/login', loginUserController);
router.post('/forgot-password', forgotPasswordController);
router.post('/verify-forgot-password', verifyForgotPasswordController);
router.post(
  '/reset-password',
  passport.authenticate('jwt', { session: false }),
  setPasswordController
);
router.get('/refresh', refreshTokenController);
router.post('/logout', logoutController);
export default router;
