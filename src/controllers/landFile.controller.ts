import prisma from '../services/prisma';
import { ExpressFunction } from '../utils/types';
import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';
import fs from 'fs';
import env from '../utils/env';

// Create a new LandFile
export const createLandFiles: ExpressFunction = async (req, res, next) => {
  try {
    const { landId } = req.params;

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];

    const fileRecords = files.map((file) => ({
      landId,
      officeId: req.user.officeId,
      filePath: file.path,
      fileUrl: env.FILE_SERVER_DOMAIN + file.path,
      fileName: file.originalname,
      fileType: file.mimetype,
    }));

    const createdFiles = await prisma.landFile.createMany({
      data: fileRecords,
    });

    res.status(201).json({
      message: 'Files uploaded and records created successfully',
      createdFiles,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

// Delete a LandFile by ID
export const deleteLandFile: ExpressFunction = async (req, res, next) => {
  try {
    const { landFileId } = req.params;

    const landFile = await prisma.landFile.delete({
      where: { id: landFileId, officeId: req.user.officeId },
    });

    fs.unlink(landFile.filePath, (err) => {});

    res.status(200).json({ message: 'Land file deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Land file not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

// Get all LandFiles with optional filtering
export const getAllLandFilesByLandId: ExpressFunction = async (
  req,
  res,
  next
) => {
  try {
    const { landId } = req.params;

    const whereCondition: any = {};
    if (landId) whereCondition.landId = landId as string;

    const landFiles = await prisma.landFile.findMany({
      where: whereCondition,
      orderBy: { uploadedAt: 'desc' },
    });

    res.status(200).json({ data: landFiles });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
