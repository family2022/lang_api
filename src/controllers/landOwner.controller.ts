import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';
import { ExpressFunction } from '../utils/types';
import Joi from 'joi';
import prisma from '../services/prisma';
import { validate } from '../utils/validation';
import { Prisma } from '../../prisma/client';
import env from '../utils/env';
import fs from 'fs';

const LandOwnerSchema = Joi.object({
  firstName: Joi.string().min(2).max(255).required(),
  middleName: Joi.string().min(2).max(255).required(),
  lastName: Joi.string().min(2).max(255).required(),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  phone: Joi.string().min(10).max(15).required(),
  email: Joi.string().email().optional(),
  nationalId: Joi.string().optional(),
});

export const createLandOwner: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(LandOwnerSchema, req.body);
    delete validatedData.nationalId;
    if (req.file) {
      validatedData.nationalIdUrl = env.FILE_SERVER_DOMAIN + req.file.path;
    }
    const newLandOwner = await prisma.landOwner.create({
      data: validatedData,
    });

    res.status(201).json({
      message: 'Land owner created successfully',
      landOwner: newLandOwner,
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
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updateLandOwner: ExpressFunction = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const validatedData = validate(LandOwnerSchema, req.body);

    delete validatedData.nationalId;
    if (req.file) {
      validatedData.nationalIdUrl = env.FILE_SERVER_DOMAIN + req.file.path;
      const landOwner = await prisma.landOwner.findUnique({
        where: { id: ownerId },
      });
      if (landOwner?.nationalIdUrl) {
        const filePath = landOwner.nationalIdUrl.replace(
          env.FILE_SERVER_DOMAIN,
          ''
        );
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    }

    const updatedLandOwner = await prisma.landOwner.update({
      where: { id: ownerId },
      data: validatedData,
    });

    res.status(200).json({
      message: 'Land owner updated successfully',
      landOwner: updatedLandOwner,
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
          .json({ error: 'Not found', message: 'LandOwner not found' });
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
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const deleteLandOwner: ExpressFunction = async (req, res, next) => {
  try {
    const { ownerId } = req.params;

    await prisma.landOwner.delete({
      where: { id: ownerId },
    });

    res.status(200).json({ message: 'Land owner deleted successfully' });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Land owner not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const getLandOwnerQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  firstName: Joi.string().optional(),
  middleName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  gender: Joi.string().valid('MALE', 'FEMALE').optional(),
});

export const getAllLandOwners: ExpressFunction = async (req, res, next) => {
  try {
    const validatedQuery = validate(getLandOwnerQuerySchema, req.query);
    const {
      skip,
      limit,
      firstName,
      middleName,
      lastName,
      email,
      phone,
      gender,
    } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const whereCondition: Prisma.LandOwnerWhereInput = {
      firstName: firstName
        ? { contains: firstName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      middleName: middleName
        ? { contains: middleName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      lastName: lastName
        ? { contains: lastName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      email: email ?? undefined,
      phone: phone ?? undefined,
      gender: gender ?? undefined,
    };

    const [landOwners, totalRecords] = await Promise.all([
      prisma.landOwner.findMany({
        skip: skipValue,
        take: limitValue,
        where: whereCondition,
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          phone: true,
          nationalIdUrl: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.landOwner.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      data: landOwners,
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
    console.log(error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const getLandOwnerById: ExpressFunction = async (req, res, next) => {
  try {
    const { ownerId } = req.params;

    const landOwner = await prisma.landOwner.findUnique({
      where: { id: ownerId },
      include: { lands: true },
    });

    if (!landOwner) {
      return res.status(404).json({ message: 'Land owner not found' });
    }

    res.status(200).json({ landOwner });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
const getLandOwnerLandHistoryQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const getLandHistoryByLandOwnerId: ExpressFunction = async (
  req,
  res,
  next
) => {
  try {
    const { ownerId } = req.params;
    const validatedQuery = validate(getLandOwnerQuerySchema, req.query);
    const { skip, limit } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const [landTransfers, totalRecords] = await Promise.all([
      prisma.landTransfer.findMany({
        where: { landOwnerId: ownerId },
        select: {
          id: true,
          transferDate: true,
          land: {
            select: {
              id: true,
              area: true,
              type: true,
              certificationNo: true,
              subcity: true,
            },
          },
        },
        orderBy: {
          transferDate: 'desc',
        },
        skip: skipValue,
        take: limitValue,
      }),
      prisma.landTransfer.count({
        where: { landOwnerId: ownerId },
      }),
    ]);

    res.status(200).json({
      data: landTransfers,
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
