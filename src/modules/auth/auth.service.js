import crypto from 'crypto';
import redis from '../../redis/index.js';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '../../utils/appError.js';
import UserModel from '../user/model/user.model.js';
import RefreshTokenModel from './model/refreshToken.model.js';
import { hashPassword } from '../../utils/argonPassword.js';
import { sendEmail } from '../../utils/sendMail.js';
import logger from '../../utils/logger.js';
export const checkOtpRestrictions = async (email, next) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new BadRequestException(
      'Account locked due to multiple failed attempts, Try again after 30 minutes'
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new BadRequestException(
      'Too many requests!, Please wait 1 hour before requesting again'
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new BadRequestException(
      'Please wait 1 minute before requesting again'
    );
  }
};

export const trackOtpRequests = async (email, next) => {
  try {
    const otpRequestKey = `otp_request_count:${email}`;
    const current = await redis.get(otpRequestKey);
    const otpRequest = parseInt(current || '0');

    if (otpRequest >= 4) {
      await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); // 1 hour
      throw new BadRequestException(
        'Too many requests!, Please wait 1 hour before requesting again'
      );
    }

    await redis.set(otpRequestKey, otpRequest + 1, 'EX', 3600);
  } catch (error) {
    throw error;
  }
};

export const sendRegisterOtp = async (user, template) => {
  try {
    const otp = crypto.randomInt(100000, 999999);

    const { email, name, role, password } = user;
    const hashedPassword = await hashPassword(password);

    //save user data on redis temporarily
    const otpData = {
      email,
      name,
      role,
      hashedPassword,
      otp,
    };

    await sendEmail(email, 'Verify your Email', template, { name, otp });

    await redis.set(`otp_data:${email}`, JSON.stringify(otpData), 'EX', 300); // 5 min
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); // 1 min cooldown
  } catch (error) {
    throw error;
  }
};

export const sendForgotPasswordOtp = async (user, template) => {
  try {
    const otp = crypto.randomInt(100000, 999999);

    const { email, name } = user;

    await sendEmail(email, 'Reset Your Password', template, { name, otp });

    await redis.set(`otp_reset_password:${email}`, otp, 'EX', 900); // 15 min
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); // 1 min cooldown
  } catch (error) {
    throw error;
  }
};

export const verifyRegisterOtp = async (email, otp) => {
  try {
    const storedOtpString = await redis.get(`otp_data:${email}`);

    if (!storedOtpString) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const parsed = JSON.parse(storedOtpString);
    const storedOtp = parsed.otp;

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
      (await redis.get(failedAttemptsKey)) || '0'
    );

    if (storedOtp.toString() !== otp) {
      if (failedAttempts >= 2) {
        await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800); // 30 min
        await redis.del(`otp_data:${email}`);
        throw new BadRequestException(
          'Too many failed attempts, your account is locked for 30 minutes'
        );
      }

      await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
      throw new BadRequestException(
        `Invalid OTP. ${2 - failedAttempts} attempts left.`
      );
    }

    await redis.del(`otp_data:${email}`);
    await redis.del(failedAttemptsKey);

    return parsed;
  } catch (error) {
    throw error;
  }
};

export const verifyForgotPasswordOtp = async (email, otp) => {
  try {
    //check if the user exist
    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('user does not exist');
    }

    const storedOtpString = await redis.get(`otp_reset_password:${email}`);

    // verify the otp on redis
    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
      (await redis.get(failedAttemptsKey)) || '0'
    );

    if (!storedOtpString || storedOtpString !== otp) {
      if (failedAttempts >= 2) {
        await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800); // 30 min
        await redis.del(`otp_reset_password:${email}`);
        throw new BadRequestException(
          'Too many failed attempts, your account is locked for 30 minutes'
        );
      }

      await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
      throw new BadRequestException(
        `Invalid OTP. ${2 - failedAttempts} attempts left.`
      );
    }
    //redis clean-up
    await Promise.all([
      redis.del(`otp_reset_password:${email}`),
      redis.del(failedAttemptsKey),
    ]);
    return user;
  } catch (error) {
    throw error;
  }
};

export const setNewPassword = async (userId, email, password) => {
  try {
    // Find user
    const user = await UserModel.findById(userId);
    if (!user || user.email.toString() !== email) {
      throw new NotFoundException('User not found or invalid details');
    }

    user.password = await hashPassword(password);
    await user.save();

    return user;
  } catch (error) {
    throw error;
  }
};

export const validateUserCredentials = async (email, password) => {
  try {
    const normalizedEmail = email.toLowerCase();
    const lockKey = `login_lock:${normalizedEmail}`;
    const failedAttemptsKey = `login_attempts:${normalizedEmail}`;

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new NotFoundException('Invalid login credentials');
    }

    const isLocked = await redis.get(lockKey);
    if (isLocked) {
      throw new BadRequestException(
        'Account locked due to multiple failed login attempts, Try again after 30 minutes'
      );
    }

    const isPassword = await user.verifyPassword(password);
    const failedAttempts = parseInt(
      (await redis.get(failedAttemptsKey)) || '0'
    );

    if (!isPassword) {
      if (failedAttempts >= 4) {
        await redis.set(lockKey, 'locked', 'EX', 1800);
        throw new BadRequestException(
          'Too many failed login attempts, your account is locked for 30 minutes'
        );
      }

      await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 1800);
      logger.warn(
        `Login attempt failed for ${normalizedEmail}, attempt: ${
          failedAttempts + 1
        }`
      );

      throw new BadRequestException(
        `Invalid details. ${4 - failedAttempts} attempts left.`
      );
    }

    await redis.del(failedAttemptsKey);
    return user;
  } catch (error) {
    throw error;
  }
};

export const verifyRefreshTokenService = async (refreshToken) => {
  try {
    const storedToken = await RefreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn('Invalid or expired refresh token');
      throw new BadRequestException('Invalid or expired refresh token');
    }

    const user = await UserModel.findById(storedToken.user);
    if (!user) {
      logger.warn('User does not exist');
      throw new NotFoundException('User does not exist');
    }

    await RefreshTokenModel.deleteOne({ _id: storedToken._id });

    return user;
  } catch (error) {
    logger.error('Refresh token error occurred', error);
    throw error;
  }
};

export const logOutService = async (refreshToken) => {
  try {
    const storedToken = await RefreshTokenModel.findOneAndDelete({
      token: refreshToken,
    });
    if (!storedToken) {
      logger.warn('Invalid refresh token provided');
      throw new NotFoundException('Invalid refresh token');
    }

    logger.info('Refresh token deleted for logout');
    return true;
  } catch (error) {
    logger.error('Error while logging out', error);
    throw error;
  }
};
