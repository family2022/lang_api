import prisma from '../services/prisma';
import Joi from 'joi';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { validate } from '../utils/validation';
import { ExpressFunction } from '../utils/types';

// Validation Schemas
const officeSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('MAIN_OFFICE', 'SUB_CITY').required(),
});

// Create an office
export const createOffice: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(officeSchema, req.body);
    const office = await prisma.office.create({
      data: validatedData,
    });
    res.status(201).json({ message: 'Office created successfully', office });
  } catch (error) {
    console.error('Error creating office:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

// Update an office
export const updateOffice: ExpressFunction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = validate(officeSchema, req.body);

    const updatedOffice = await prisma.office.update({
      where: { id },
      data: validatedData,
    });

    res
      .status(200)
      .json({ message: 'Office updated successfully', updatedOffice });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({ error: 'Office not found' });
    }
    console.error('Error updating office:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

// Delete an office
export const deleteOffice: ExpressFunction = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.office.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Office deleted successfully' });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({ error: 'Office not found' });
    }
    console.error('Error deleting office:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

// Get all offices with optional pagination
export const getAllOffices: ExpressFunction = async (req, res, next) => {
  try {
    const { type } = req.query;
    const whereCondition: any = {};
    if (type) whereCondition.type = type;
    const [offices, totalRecords] = await Promise.all([
      prisma.office.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.office.count({}),
    ]);

    res.status(200).json({
      data: offices,
      totalRecords,
    });
  } catch (error) {
    console.error('Error fetching offices:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
