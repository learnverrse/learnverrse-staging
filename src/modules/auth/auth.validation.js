import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters'),

  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),

  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, 'Password must be at least 8 characters long'),

  role: z.enum(['learner', 'educator'], {
    required_error: 'Role is required, "learner" or "educator"',
    invalid_type_error: 'Role must be either "learner" or "educator"',
  }),
});

export const VerifyRegisterOtpSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),

  otp: z.string().min(6).max(6),
});

// Login Schema
export const LoginUserSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  }),
});

export const UserEmailSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),
});

export const verifyForgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),

  otp: z.string().min(6).max(6),
});
export const VerifyForgotPasswordOtpSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),

  otp: z.string().min(6).max(6),
});
export const setNewPasswordSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
  }),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, 'Password must be at least 8 characters long'), // corrected from 6 to 8
  //   .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  //   .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  //   .regex(/[0-9]/, 'Password must contain at least one number')
  //   .regex(
  //     /[^A-Za-z0-9]/,
  //     'Password must contain at least one special character'
  //   )
});
