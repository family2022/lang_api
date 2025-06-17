import { ExpressFunction } from '../utils/types';
import { validate } from '../utils/validation';
import Joi from 'joi';
import prisma from '../services/prisma';
import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';
import { EMPLOYEE_STATUS, Prisma } from '../../prisma/client';

const employeeSchema = Joi.object({
  firstName: Joi.string().min(2).max(255).required(),
  middleName: Joi.string().min(2).max(255).required(),
  lastName: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).required(),
  salary: Joi.number().positive().required(),
  position: Joi.string().min(2).max(255).required(),
  status: Joi.string()
    .valid(
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED',
      'TERMINATED',
      'ON_LEAVE',
      'RETIRED'
    )
    .optional(),
  gender: Joi.string().valid('MALE', 'FEMALE'),
});

export const createEmployee: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(employeeSchema, req.body);

    const newEmployee = await prisma.employee.create({
      data: { ...validatedData, officeId: req.user.officeId },
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee: newEmployee,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({ error: 'Bad Request', message: error.message });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res
          .status(409)
          .json({ error: 'Conflict', message: 'Employee already exists' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const updateEmployee: ExpressFunction = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const validatedData = validate(employeeSchema, req.body);

    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: validatedData,
    });

    res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedEmployee,
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
          .json({ error: 'Not Found', message: 'Employee not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const deleteEmployee: ExpressFunction = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    await prisma.employee.delete({
      where: { id: employeeId },
    });

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res
          .status(404)
          .json({ error: 'Not Found', message: 'Employee not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const getEmployeeQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  firstName: Joi.string().min(2).max(255).optional(),
  middleName: Joi.string().min(2).max(255).optional(),
  lastName: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(15).optional(),
  position: Joi.string().min(2).max(255).optional(),
  status: Joi.string()
    .valid(
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED',
      'TERMINATED',
      'ON_LEAVE',
      'RETIRED'
    )
    .optional(),
  officeId: Joi.string().optional().allow(null),
});

export const getAllEmployees: ExpressFunction = async (req, res, next) => {
  try {
    const validatedQuery = validate(getEmployeeQuerySchema, req.query);
    const {
      skip,
      limit,
      firstName,
      middleName,
      lastName,
      email,
      phone,
      position,
      status,
      officeId,
    } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const whereCondition: Prisma.EmployeeWhereInput = {
      firstName: firstName
        ? { contains: firstName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      middleName: middleName
        ? { contains: middleName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      lastName: lastName
        ? { contains: lastName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      email: email
        ? { contains: email, mode: Prisma.QueryMode.insensitive }
        : undefined,
      phone: phone
        ? { contains: phone, mode: Prisma.QueryMode.insensitive }
        : undefined,
      position: position
        ? { contains: position, mode: Prisma.QueryMode.insensitive }
        : undefined,
      status: status ?? undefined, // Status is directly assigned
      officeId: req.user.officeId === undefined ? officeId : req.user.officeId,
      // officeId: req.user?.officeId ?? undefined, // Only assign officeId if user has it
    };

    const [employees, totalRecords] = await Promise.all([
      prisma.employee.findMany({
        skip: skipValue,
        take: limitValue,
        where: whereCondition,
        orderBy: { registeredAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          position: true,
          status: true,
          salary: true,
          officeId: true,
          registeredAt: true,
        },
      }),
      prisma.employee.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      data: employees,
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

export const getEmployeeById: ExpressFunction = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ employee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
