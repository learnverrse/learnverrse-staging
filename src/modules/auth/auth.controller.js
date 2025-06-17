import { HTTPSTATUS } from '../../configs/http.config.js';
import { ProviderEnum } from '../../enums/account-provider.enum.js';
import {
  BadRequestException,
  NotFoundException,
} from '../../utils/appError.js';
import generateJwtToken from '../../utils/generateJwt.js';
import logger from '../../utils/logger.js';
import UserModel from '../user/model/user.model.js';
import AsyncHandler from '../../middlewares/asyncHandler.js';
import {
  checkOtpRestrictions,
  logOutService,
  sendForgotPasswordOtp,
  sendRegisterOtp,
  setNewPassword,
  trackOtpRequests,
  validateUserCredentials,
  verifyForgotPasswordOtp,
  verifyRefreshTokenService,
  verifyRegisterOtp,
} from './auth.service.js';
import {
  LoginUserSchema,
  RegisterUserSchema,
  setNewPasswordSchema,
  UserEmailSchema,
  verifyForgotPasswordSchema,
  VerifyRegisterOtpSchema,
} from './auth.validation.js';
import { config } from '../../configs/app.config.js';

const isProduction = config.NODE_ENV === 'production';

// Regular registration controller
export const registerUserController = AsyncHandler(async (req, res, next) => {
  const body = RegisterUserSchema.parse({ ...req.body });

  const { email } = body;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new BadRequestException('Email already in use');
  }

  await checkOtpRestrictions(email, next);
  await trackOtpRequests(email, next);

  await sendRegisterOtp(body, 'user-activation-mail');

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Verify your email to continue',
  });
});

export const verifyRegisterController = AsyncHandler(async (req, res, next) => {
  const body = VerifyRegisterOtpSchema.parse({ ...req.body });
  const userData = await verifyRegisterOtp(body.email, body.otp);

  const { email, hashedPassword, name, role } = userData;

  const account = {
    provider: ProviderEnum.EMAIL,
    providerId: email,
    googleAccessToken: '',
    googleRefreshToken: '',
  };

  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    role: role,
    account,
  });

  await newUser.save();

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'User registered successfully',
  });
});

// login user (Learner or Educator)
export const loginUserController = AsyncHandler(async (req, res, next) => {
  const body = LoginUserSchema.parse({ ...req.body });

  const { email, password } = body;

  const user = await validateUserCredentials(email, password);

  const { accessToken, refreshToken } = await generateJwtToken(user);

  const userOmitPassword = user.omitPassword();

  return res
    .status(HTTPSTATUS.OK)
    .cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .json({
      success: true,
      message: 'login successful',
      user: userOmitPassword,
      token: accessToken,
    });
});

export const refreshTokenController = AsyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    logger.warn('Refresh token missing');
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: 'Refresh token missing',
    });
  }
  const token = cookies.jwt;
  const user = await verifyRefreshTokenService(token);

  if (!user) {
    logger.warn(`Cannot get refresh token`);
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: ' Cannot verify token, kindly log in again',
    });
  }
  logger.info('Refresh token verified ');
  // generate new tokens for user
  const { accessToken, refreshToken } = await generateJwtToken(user);

  return res
    .status(HTTPSTATUS.OK)
    .cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
    .json({
      success: true,
      token: accessToken,
    });
});

export const logoutController = AsyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    logger.warn('Refresh token missing');
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: 'Refresh token missing',
    });
  }
  const token = cookies.jwt;

  await logOutService(token);

  return res
    .status(HTTPSTATUS.OK)
    .clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    .json({
      success: true,
      message: 'Logged out successfully!',
    });
});

export const forgotPasswordController = AsyncHandler(async (req, res, next) => {
  const body = UserEmailSchema.parse({ ...req.body });

  const { email } = body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new NotFoundException('User not found or invalid details');
  }

  await checkOtpRestrictions(email, next);
  await trackOtpRequests(email);
  await sendForgotPasswordOtp(user, 'forgot-password-mail');
  logger.warn('Password reset otp sent');

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Password reset OTP sent!, check you email',
  });
});

export const verifyForgotPasswordController = AsyncHandler(
  async (req, res, next) => {
    const { email, otp } = verifyForgotPasswordSchema.parse({ ...req.body });

    const user = await verifyForgotPasswordOtp(email, otp);

    const { accessToken } = await generateJwtToken(user);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'OTP code verified',
      passwordResetToken: accessToken,
    });
  }
);

export const setPasswordController = AsyncHandler(async (req, res, next) => {
  const body = setNewPasswordSchema.parse({ ...req.body });

  const userId = req?.user?._id;
  const { email, password } = body;

  const user = await setNewPassword(userId, email, password);
  if (!user) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: 'set new password failed',
    });
  }

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Password set successfully',
  });
});
