import { ExpressFunction } from '../utils/types';
import { validate } from '../utils/validation';
import Joi from 'joi';
import prisma from '../services/prisma';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '../../prisma/client/runtime/library';

// Validation schema for creating land
const landSchema = Joi.object({
  landOwnerId: Joi.string().uuid().optional(),
  name: Joi.string().optional(),
  area: Joi.number().positive().required(),
  type: Joi.string().optional(),
  grade: Joi.number().integer().min(1).optional(),
  registrationNo: Joi.number().integer().positive().optional(),
  parcelId: Joi.string().optional(),
  certificationNo: Joi.string().optional(),
  wereda: Joi.string().min(1).required(),
  subcity: Joi.string().min(1).optional(),
  absoluteLocation: Joi.string().optional(),
  mapUrl: Joi.string().uri().optional(),
  comment: Joi.string().optional(),
  landUsePurpose: Joi.string().optional(),
  marketValue: Joi.number().positive().optional(),
  encumbrances: Joi.string().optional(),
  landStatus: Joi.string().optional(),
  ownershipType: Joi.string()
    .valid(
      'PRIVATE',
      'GOVERNMENT',
      'ORGANIZATION',
      'COOPERATIVE',
      'JOINT_OWNERSHIP',
      'COMMUNITY',
      'TRUST',
      'NOT_ASSIGNED'
    )
    .optional(),
});

export const createLand: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(landSchema, req.body);

    if (validatedData.landOwnerId) {
      const landOwner = await prisma.landOwner.findUnique({
        where: { id: validatedData.landOwnerId },
      });
      if (landOwner) {
        const { firstName, middleName, lastName } = landOwner;
        validatedData.name = `${firstName} ${middleName} ${lastName}`;
      }
    }

    const newLand = await prisma.land.create({
      data: {
        ...validatedData,
        registeredBy: req.user.id,
        officeId: req.user.officeId,
      },
    });

    if (validatedData.landOwnerId) {
      await prisma.landTransfer.create({
        data: {
          landId: newLand.id,
          landOwnerId: validatedData.landOwnerId,
          transferredBy: req.user.id,
        },
      });
    }

    return res
      .status(201)
      .json({ message: 'Land created successfully', land: newLand });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return res
          .status(400)
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

export const updateLand: ExpressFunction = async (req, res, next) => {
  try {
    const { landId } = req.params; // Land ID
    const validatedData = validate(landSchema, req.body);

    const updatedLand = await prisma.land.update({
      where: { id: landId },
      data: validatedData,
    });

    res
      .status(200)
      .json({ message: 'Land updated successfully', land: updatedLand });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Land not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const deleteLand: ExpressFunction = async (req, res, next) => {
  try {
    const { landId } = req.params; // Land ID

    await prisma.land.delete({
      where: { id: landId },
    });

    res.status(200).json({ message: 'Land deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Land not found' });
      }
      if (error.code === 'P2003')
        return res.status(404).json({ error: 'Land can not be deleted' });
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const getAllLandQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  landOwnerId: Joi.string().uuid().optional(),
  type: Joi.string().optional(),
  landStatus: Joi.string().optional(),
  registrationNo: Joi.number().integer().positive().optional(),
  certificationNo: Joi.string().optional(),
  name: Joi.string().optional(),
  officeId: Joi.string().optional().allow(null),
});
export const getAllLands: ExpressFunction = async (req, res, next) => {
  try {
    const validatedQuery = validate(getAllLandQuerySchema, req.query);
    const {
      landOwnerId,
      type,
      skip,
      limit,
      landStatus,
      name,
      registrationNo,
      certificationNo,
      officeId,
    } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const whereCondition: any = {};
    if (landOwnerId) {
      whereCondition.landOwnerId = {
        contains: landOwnerId as string,
        mode: 'insensitive',
      };
    }
    if (name) {
      whereCondition.name = {
        contains: name as string,
        mode: 'insensitive',
      };
    }
    if (type) {
      whereCondition.type = type;
    }
    if (landStatus) {
      whereCondition.landStatus = landStatus;
    }
    if (registrationNo) whereCondition.registrationNo = registrationNo;
    if (certificationNo) whereCondition.certificationNo = certificationNo;
    if (req.user.officeId === undefined) {
      if (officeId) {
        whereCondition.officeId = officeId as string;
      }
    }
    if (req.user.officeId) {
      whereCondition.officeId = req.user.officeId as string;
    }

    const [lands, totalRecords] = await Promise.all([
      prisma.land.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          area: true,
          type: true,
          wereda: true,
          landOwnerId: true,
        },
        skip: skipValue,
        take: limitValue,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.land.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      data: lands,
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

export const getLandById: ExpressFunction = async (req, res, next) => {
  try {
    const { landId } = req.params;

    const land = await prisma.land.findUnique({
      where: { id: landId },
      include: {
        landOwner: true,
        landFiles: true,
        landTransferHistory: {
          include: {
            landOwner: true,
            landTransferFiles: true,
          },
        },
      }, // Include LandOwner in the response
    });

    if (!land) {
      return res.status(404).json({ message: 'Land not found' });
    }

    res.status(200).json({ land });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const transferLandSchema = Joi.object({
  landId: Joi.string().uuid().required(),
  newLandOwnerId: Joi.string().uuid().required(),
});

export const transferLandOwnership: ExpressFunction = async (
  req,
  res,
  next
) => {
  try {
    // Validate the incoming data
    const validatedData = validate(transferLandSchema, req.body);
    const { landId, newLandOwnerId } = validatedData;

    if (validatedData.newLandOwnerId) {
      const landOwner = await prisma.landOwner.findUnique({
        where: { id: validatedData.newLandOwnerId },
      });
      if (landOwner) {
        const { firstName, middleName, lastName } = landOwner;
        validatedData.name = `${firstName} ${middleName} ${lastName}`;
      }
    }

    const land = await prisma.land.findUnique({ where: { id: landId } });
    if (!land) {
      return res
        .status(404)
        .json({ error: 'Not Found', message: 'Land not found' });
    }

    if (land.landStatus === 'RESTRICTED') {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message:
          'Transfer of this land is restricted. Please contact the relevant authorities for further information.',
      });
    }

    // Update the land's owner
    const updatedLand = await prisma.land.update({
      where: { id: landId },
      data: {
        landOwnerId: newLandOwnerId,
        name: validatedData.name ?? undefined,
      },
    });

    await prisma.landTransfer.create({
      data: {
        landId: landId,
        landOwnerId: newLandOwnerId,
        transferredBy: req.user.id,
      },
    });

    res.status(200).json({
      message: 'Land ownership transferred successfully',
      land: updatedLand,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        const metaTarget = error.meta?.modelName as string;
        switch (metaTarget) {
          case 'Land':
            return res
              .status(404)
              .json({ error: 'Not Found', message: 'Land not found' });
        }
      } else if (error.code === 'P2003') {
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

const transferHistoryQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
export const getLandTransferHistoryByLandId: ExpressFunction = async (
  req,
  res,
  next
) => {
  try {
    const { landId } = req.params;
    const validatedQuery = validate(transferHistoryQuerySchema, req.query);
    const { skip, limit } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const [transferHistory, totalRecords] = await Promise.all([
      prisma.landTransfer.findMany({
        where: { landId },
        select: {
          id: true,
          transferDate: true,
          landOwner: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
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
        where: { landId },
      }),
    ]);

    res.status(200).json({
      data: transferHistory,
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
