import { APPOINTMENT_STATUS, Prisma } from '../../prisma/client';
import { ExpressFunction } from '../utils/types';
import prisma from '../services/prisma';
import Joi from 'joi';
import { validate } from '../utils/validation';
import { PrismaClientKnownRequestError } from '../../prisma/client/runtime/library';

const appointmentSchema = Joi.object({
  firstName: Joi.string().min(2).max(255).required(),
  middleName: Joi.string().min(2).max(255).required(),
  lastName: Joi.string().min(2).max(255).required(),
  phone: Joi.string().min(10).max(15).required(),
  email: Joi.string().email().optional(),
  address: Joi.string().min(5).max(500).required(),
  reason: Joi.string().min(5).max(1000).required(),
  officeId: Joi.string().uuid().required(),
});

export const createAppointment: ExpressFunction = async (req, res, next) => {
  try {
    const validatedData = validate(appointmentSchema, req.body);

    const existingAppointment = await prisma.appointment.findFirst({
      where: { phone: validatedData.phone },
      orderBy: {
        appointedAt: 'desc',
      },
    });

    if (existingAppointment?.status === APPOINTMENT_STATUS.PENDING) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You already have a pending appointment',
      });
    }

    const newAppointment = await prisma.appointment.create({
      data: validatedData,
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment,
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

export const approveAppointment: ExpressFunction = async (req, res, next) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
        OR: [
          { status: APPOINTMENT_STATUS.PENDING },
          { status: APPOINTMENT_STATUS.REJECTED },
        ],
      },
      data: { status: APPOINTMENT_STATUS.APPROVED },
    });

    res.status(200).json({ message: 'Appointment approved', appointment });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    }
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const completeAppointment: ExpressFunction = async (req, res, next) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId, status: APPOINTMENT_STATUS.APPROVED },
      data: { status: APPOINTMENT_STATUS.COMPLETED },
    });

    res.status(200).json({ message: 'Appointment completed', appointment });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    }
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const rejectAppointment: ExpressFunction = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { rejectionReason } = req.body;
  try {
    if (!rejectionReason) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Rejection reason is required',
      });
    }
    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
        OR: [
          { status: APPOINTMENT_STATUS.PENDING },
          { status: APPOINTMENT_STATUS.APPROVED },
        ],
      },
      data: { status: APPOINTMENT_STATUS.REJECTED, rejectionReason },
    });

    res.status(200).json({ message: 'Appointment rejected', appointment });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    }
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

export const cancelAppointment: ExpressFunction = async (req, res, next) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
        OR: [
          { status: APPOINTMENT_STATUS.PENDING },
          { status: APPOINTMENT_STATUS.APPROVED },
        ],
      },
      data: { status: APPOINTMENT_STATUS.CANCELLED },
    });

    res.status(200).json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    }
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};

const getAppointmentQuerySchema = Joi.object({
  skip: Joi.number().integer().min(0).default(0),
  limit: Joi.number().integer().min(1).max(100).default(10),
  firstName: Joi.string().min(2).max(255).optional(),
  middleName: Joi.string().min(2).max(255).optional(),
  lastName: Joi.string().min(2).max(255).optional(),
  phone: Joi.string().min(10).max(15).optional(),
  email: Joi.string().email().optional(),
  status: Joi.string()
    .valid('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED')
    .optional(),
});

export const getAllAppointments: ExpressFunction = async (req, res, next) => {
  try {
    const validatedQuery = validate(getAppointmentQuerySchema, req.query);
    const {
      skip,
      limit,
      status,
      phone,
      email,
      firstName,
      middleName,
      lastName,
    } = validatedQuery;

    const skipValue = parseInt(skip as string, 10);
    const limitValue = parseInt(limit as string, 10);

    const whereCondition: Prisma.AppointmentWhereInput = {
      status: status ?? undefined,
      phone: phone
        ? { contains: phone, mode: Prisma.QueryMode.insensitive }
        : undefined,
      email: email
        ? { contains: email, mode: Prisma.QueryMode.insensitive }
        : undefined,
      firstName: firstName
        ? { contains: firstName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      middleName: middleName
        ? { contains: middleName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      lastName: lastName
        ? { contains: lastName, mode: Prisma.QueryMode.insensitive }
        : undefined,
      officeId: req.user?.officeId ?? undefined,
    };

    const [appointments, totalRecords] = await Promise.all([
      prisma.appointment.findMany({
        skip: skipValue,
        take: limitValue,
        where: whereCondition,
        orderBy: { appointedAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          phone: true,
          status: true,
          appointedAt: true,
        },
      }),
      prisma.appointment.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      data: appointments,
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

export const getAppointmentById: ExpressFunction = async (req, res, next) => {
  const { appointmentId } = req.params;
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ appointment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  }
};
