import { ExpressFunction } from '../utils/types';
import { validate } from '../utils/validation';
import Joi from 'joi';
import prisma from '../services/prisma';
import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';
import { Prisma } from '../../prisma/client';

const feedbackSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).optional(),
  comment: Joi.string().min(5).max(1000).optional(),
  status: Joi.string().valid('PENDING', 'RESOLVED', 'ARCHIVED').optional(),
  officeId: Joi.string().uuid().optional(),
});

export const createFeedback: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(feedbackSchema, req.body);

    const newFeedback = await prisma.feedback.create({
      data: validatedData,
    });

    res.status(201).json({
      message: 'Feedback created successfully',
      feedback: newFeedback,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updateFeedback: ExpressFunction = async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const validatedData = validate(feedbackSchema, req.body);

    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: validatedData,
    });

    res.status(200).json({
      message: 'Feedback updated successfully',
      feedback: updatedFeedback,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Feedback not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const deleteFeedback: ExpressFunction = async (req, res, next) => {
  try {
    const { feedbackId } = req.params;

    await prisma.feedback.delete({
      where: { id: feedbackId },
    });

    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Feedback not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const getFeedbackQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).optional(),
  status: Joi.string().valid('PENDING', 'RESOLVED', 'ARCHIVED').optional(),
});

export const getAllFeedbacks: ExpressFunction = async (req, res, next) => {
  try {
    const validatedQuery = validate(getFeedbackQuerySchema, req.query);
    const { skip, limit, email, phone, status } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const whereCondition: Prisma.FeedbackWhereInput = {
      email: email
        ? { contains: email, mode: Prisma.QueryMode.insensitive }
        : undefined,
      phone: phone
        ? { contains: phone, mode: Prisma.QueryMode.insensitive }
        : undefined,
      status: status ? status : undefined,
      // officeId: req.user?.officeId ?? undefined,
    };

    const [feedbacks, totalRecords] = await Promise.all([
      prisma.feedback.findMany({
        skip: skipValue,
        take: limitValue,
        where: whereCondition,
        orderBy: { feedbackDate: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          comment: true,
          status: true,
        },
      }),
      prisma.feedback.count({
        where: whereCondition,
      }),
    ]);

    const resizedFeedbacks = feedbacks.map((f) => {
      return {
        ...f,
        comment:
          f.comment.length > 50 ? f.comment.slice(0, 50) + '...' : f.comment,
      };
    });

    res.status(200).json({
      data: resizedFeedbacks,
      totalRecords,
      currentPage: Math.floor(skipValue / limitValue) + 1,
      totalPages: Math.ceil(totalRecords / limitValue),
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const getFeedbackById: ExpressFunction = async (req, res, next) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
