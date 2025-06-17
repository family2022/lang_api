import { ExpressFunction } from '../utils/types';
import bcrypt from 'bcrypt';

import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';
import jwt from 'jsonwebtoken';
import env from '../utils/env';
import Joi from 'joi';
import prisma from '../services/prisma';
import { sendTextEmail } from '../utils/mailer';
import { validate } from '../utils/validation';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  username: Joi.string().min(1).max(255).optional(), // Added username validation
  role: Joi.string()
    .valid(
      'DATABASE_ADMIN',
      'SYSTEM_ADMIN',
      'HEAD',
      'HR',
      'FINANCE',
      'RECEPTION',
      'LAND_BANK',
      'OFFICER',
      'OTHER'
    )
    .default('OTHER'), // Updated role validation based on your USER_ROLE enum
  firstName: Joi.string().min(3).max(255).required(),
  middleName: Joi.string().min(3).max(255).required(),
  lastName: Joi.string().min(3).max(255).required(),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'DEACTIVATED', 'BLOCKED')
    .optional(),
  officeId: Joi.string().optional().allow(null),
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

export const register: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(userSchema, req.body);
    // Hash password
    // const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        username: validatedData.username ?? validatedData.email.split('@')[0],
        officeId: req.user.officeId,
      },
    });
    res.status(201).json({
      message: 'User registered successfully',
      user: { ...newUser, password: undefined },
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const metaTarget = error.meta?.target as string[];
        switch (metaTarget[0]) {
          case 'email':
            return res
              .status(409)
              .json({ error: 'Conflict', message: 'Email already exists' });
          case 'phone':
            return res
              .status(409)
              .json({ error: 'Conflict', message: 'Phone already exists' });
        }
      }
    }
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const login: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(loginSchema, req.body);
    const { identifier, password } = validatedData;

    const isEmail = identifier.includes('@');

    const user = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { username: identifier },
    });

if (!user) {
  return res
    .status(404)
    .json({ error: 'Not Found', message: 'User not found' });
} else if (['DEACTIVATED', 'BLOCKED'].includes(user.status)) {
  return res.status(401).json({
    error: 'Unauthorized',
    message:
      'Your account is currently deactivated or blocked. Please contact support for assistance.',
  });
}

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      {
        expiresIn: '16h',
      }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { ...user, password: undefined, role: undefined },
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    }
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updatePassword: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(updatePasswordSchema, req.body);
    const { newPassword, oldPassword } = validatedData;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Unable to update password' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user?.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'User not found' });
      }
    }
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updateUser: ExpressFunction = async (req, res, next) => {
  try {
    // Validate the incoming data
    const validatedData = validate(userSchema, req.body);
    const { userId } = req.params; // Assuming we're passing user ID in the URL

    // Update the user with the new data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { ...validatedData, officeId: req.user.officeId },
    });

    res.status(200).json({
      message: 'User updated successfully',
      user: { ...updatedUser, password: undefined },
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const metaTarget = error.meta?.target as string[];
        switch (metaTarget[0]) {
          case 'email':
            return res
              .status(409)
              .json({ error: 'Conflict', message: 'Email already exists' });
          case 'phone':
            return res
              .status(409)
              .json({ error: 'Conflict', message: 'Phone already exists' });
        }
      } else if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'User not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const removeUser: ExpressFunction = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot delete your own account',
      });
    }
    await prisma.user.delete({
      where: { id: userId },
    });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
    }
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const requestPasswordReset: ExpressFunction = async (req, res, next) => {
  try {
    const { email } = validate(requestPasswordResetSchema, req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: '1h',
    });

    sendTextEmail({
      receiver: email,
      subject: 'Password Reset',
      text: `${env.CLIENT_DOMAIN}/auth/reset?token=${resetToken}`,
    });

    res.status(200).json({
      message: 'Password reset link has been sent to your email',
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    }
    console.error('Error requesting password reset:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

export const resetPassword: ExpressFunction = async (req, res, next) => {
  try {
    const { token, newPassword } = validate(resetPasswordSchema, req.body);

    // Verify reset token
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    console.error('Error resetting password:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
