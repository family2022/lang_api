import { APPOINTMENT_STATUS, Prisma } from '../../prisma/client';
import { ExpressFunction } from '../utils/types';
import prisma from '../services/prisma';
import Joi from 'joi';
import { validate } from '../utils/validation';
import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';

const announcementSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(5).required(),
  number: Joi.number().integer().positive().required(),
  stampFile: Joi.string().optional(),
  signatureFile: Joi.string().optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
});

export const createAnnouncement: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(announcementSchema, req.body);

    const newAnnouncement = await prisma.announcement.create({
      data: {
        ...validatedData,
        officeId: req.user.officeId,
        publisherId: req.user.id,
      },
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: newAnnouncement,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Announcement number already exists',
        });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updateAnnouncement: ExpressFunction = async (req, res, next) => {
  try {
    const { announcementId } = req.params;
    const validatedData = validate(announcementSchema, req.body);

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: { ...validatedData, auditorId: req.user.id },
    });

    res.status(200).json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement,
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
          .json({ error: 'Not Found', message: 'Announcement not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const deleteAnnouncement: ExpressFunction = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    await prisma.announcement.delete({
      where: { id: announcementId, publisherId: req.user.id },
    });

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Announcement not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const getAnnouncementQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  title: Joi.string().min(2).max(255).optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
  number: Joi.string().optional(),
});

export const getAllAnnouncements: ExpressFunction = async (req, res, next) => {
  try {
    const validatedQuery = validate(getAnnouncementQuerySchema, req.query);
    const { skip, limit, title, status, number } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const whereCondition: Prisma.AnnouncementWhereInput = {
      title: title
        ? { contains: title, mode: Prisma.QueryMode.insensitive }
        : undefined,
      status: status ?? undefined,
      number: number ? parseInt(number, 10) : undefined,
      officeId: req.user?.officeId ?? undefined,
    };

    const [announcements, totalRecords] = await Promise.all([
      prisma.announcement.findMany({
        skip: skipValue,
        take: limitValue,
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          number: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.announcement.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      data: announcements,
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

export const getAnnouncementById: ExpressFunction = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(200).json({ announcement });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
