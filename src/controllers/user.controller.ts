import Joi from 'joi';
import prisma from '../services/prisma';
import { ExpressFunction } from '../utils/types';
import { validate } from '../utils/validation';

export const getUserById: ExpressFunction = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const querySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  firstName: Joi.string().optional(),
  middleName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  userId: Joi.string().optional(),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED')
    .default('ACTIVE'),
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
    .optional(),
  officeId: Joi.string().optional().allow(null),
});

export const getAllUsers: ExpressFunction = async (req, res, next) => {
  try {
    const validatedQuery = validate(querySchema, req.query);
    const {
      skip,
      limit,
      firstName,
      middleName,
      lastName,
      email,
      phone,
      status,
      role,
      userId,
      officeId,
    } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const whereCondition: any = {};

    if (firstName) {
      whereCondition.firstName = {
        contains: firstName as string,
        mode: 'insensitive',
      };
    }
    if (middleName) {
      whereCondition.middleName = {
        contains: middleName as string,
        mode: 'insensitive',
      };
    }
    if (lastName) {
      whereCondition.lastName = {
        contains: lastName as string,
        mode: 'insensitive',
      };
    }
    if (email) {
      whereCondition.email = { contains: email as string, mode: 'insensitive' };
    }
    if (phone) {
      whereCondition.phone = { contains: phone as string, mode: 'insensitive' };
    }
    if (status) {
      whereCondition.status = status as string;
    }
    if (role) {
      whereCondition.role = role as string;
    }
    if (userId) {
      whereCondition.id = userId as string;
    }
    if (req.user.officeId === undefined) {
      if (officeId) {
        whereCondition.officeId = officeId as string;
      }
    }
    if (req.user.officeId) {
      whereCondition.officeId = req.user.officeId as string;
    }

    const [users, totalRecords] = await Promise.all([
      prisma.user.findMany({
        skip: skipValue,
        take: limitValue,
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          role: true,
          officeId: true,
        },
      }),
      prisma.user.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      data: users,
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
