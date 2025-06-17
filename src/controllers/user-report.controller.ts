import { Prisma } from '../../prisma/client';
import { ExpressFunction } from '../utils/types';
import prisma from '../services/prisma';
import Joi from 'joi';
import { validate } from '../utils/validation';
import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';

const reportSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  description: Joi.string().min(5).max(1000).required(),
});

export const createReport: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(reportSchema, req.body);
    console.log(req.user);
    console.log(req.user.officeId);
    const newReport = await prisma.userReport.create({
      data: {
        ...validatedData,
        userId: req.user.id,
        officeId: req.user.officeId,
      },
    });

    res.status(201).json({
      message: 'Report created successfully',
      report: newReport,
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

export const getReports: ExpressFunction = async (req, res, next) => {
  try {
    const { userId, officeId, skip = 0, limit = 10 } = req.query;
    const user = req.user;
    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    // Initialize where condition
    let whereCondition: Prisma.UserReportWhereInput = {
      officeId: user.officeId ?? undefined,
      userId: user.role === 'HEAD' ? undefined : user.id,
    };

    const [reports, totalRecords] = await Promise.all([
      prisma.userReport.findMany({
        skip: skipValue,
        take: limitValue,
        where: whereCondition,
        orderBy: { reportedAt: 'desc' },
        select: {
          id: true,
          userId: true,
          startDate: true,
          endDate: true,
          description: true,
          reportedAt: true,
          officeId: true,
          office: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.userReport.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      data: reports,
      totalRecords,
      currentPage: Math.floor(skipValue / limitValue) + 1,
      totalPages: Math.ceil(totalRecords / limitValue),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const getReportById: ExpressFunction = async (req, res, next) => {
  const { reportId } = req.params;
  try {
    const report = await prisma.userReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        userId: true,
        startDate: true,
        endDate: true,
        description: true,
        reportedAt: true,
        officeId: true,
        office: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updateReport: ExpressFunction = async (req, res, next) => {
  const { reportId } = req.params;
  try {
    const validatedData = validate(reportSchema, req.body);

    const updatedReport = await prisma.userReport.update({
      where: { id: reportId, userId: req.user.id },
      data: validatedData,
    });

    res
      .status(200)
      .json({ message: 'Report updated successfully', report: updatedReport });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({ error: 'Report not found' });
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const deleteReport: ExpressFunction = async (req, res, next) => {
  const { reportId } = req.params;
  try {
    await prisma.userReport.delete({
      where: { id: reportId, userId: req.user.id },
    });

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({ error: 'Report not found' });
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
