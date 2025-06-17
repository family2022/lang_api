import express from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware';

const router = express.Router();

// Create a new appointment
router.post('/create', appointmentController.createAppointment);

// Approve an appointment
router.patch(
  '/approve/:appointmentId',
  isAuthorized,
  authorizationRole(['RECEPTION']),
  appointmentController.approveAppointment
);

// Complete an appointment
router.patch(
  '/complete/:appointmentId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'HEAD', 'OFFICER']),
  appointmentController.completeAppointment
);

// Reject an appointment
router.patch(
  '/reject/:appointmentId',
  isAuthorized,
  authorizationRole(['RECEPTION']),
  appointmentController.rejectAppointment
);

// Cancel an appointment
// router.patch(
//   '/cancel/:appointmentId',
//   isAuthorized,
//   appointmentController.cancelAppointment
// );

// Get all appointments
router.get(
  '/all',
  isAuthorized,
  authorizationRole(['RECEPTION', 'SYSTEM_ADMIN', 'HEAD', 'OFFICER']),
  appointmentController.getAllAppointments
);

// Get appointment by ID
router.get(
  '/get/:appointmentId',
  isAuthorized,
  authorizationRole(['RECEPTION', 'SYSTEM_ADMIN', 'HEAD', 'OFFICER']),
  appointmentController.getAppointmentById
);

export default router;
