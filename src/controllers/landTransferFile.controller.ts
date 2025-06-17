import prisma from '../services/prisma';
import { ExpressFunction } from '../utils/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Create new LandTransferFiles
export const createLandTransferFiles: ExpressFunction = async (
  req,
  res,
  next
) => {
  try {
    const { landTransferId } = req.params;

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];

    const fileRecords = files.map((file) => ({
      landTransferId, // Corrected the field name here
      officeId: req.user.officeId,
      filePath: file.path,
      fileName: file.originalname,
      fileType: file.mimetype,
    }));

    const createdFiles = await prisma.landTransferFile.createMany({
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

// Delete a LandTransferFile by ID
export const deleteLandTransferFile: ExpressFunction = async (
  req,
  res,
  next
) => {
  try {
    const { landTransferFileId } = req.params;

    await prisma.landTransferFile.delete({
      where: { id: landTransferFileId, officeId: req.user.officeId },
    });

    res
      .status(200)
      .json({ message: 'Land transfer file deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Land transfer file not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

// Get all LandTransferFiles with optional filtering
export const getAllLandTransferFilesByLandTransferId: ExpressFunction = async (
  req,
  res,
  next
) => {
  try {
    const { landTransferId } = req.params;

    const whereCondition: any = {};
    if (landTransferId)
      whereCondition.landTransferId = landTransferId as string;

    const landTransferFiles = await prisma.landTransferFile.findMany({
      where: whereCondition,
      orderBy: { uploadedAt: 'desc' },
    });

    res.status(200).json({ data: landTransferFiles });
  } catch (error) {
    console.error('Error fetching land transfer files:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
