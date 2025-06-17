import { Router } from 'express';
import * as officeController from '../controllers/office.controller';
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware';

const router = Router();

// Create a new office
router.post(
  '/create',
  isAuthorized,
  authorizationRole(['DATABASE_ADMIN']),
  officeController.createOffice
);

// Update an existing office by ID
router.put(
  '/update/:id',
  isAuthorized,
  authorizationRole(['DATABASE_ADMIN']),
  officeController.updateOffice
);

// Delete an office by ID
router.delete(
  '/delete/:id',
  isAuthorized,
  authorizationRole(['DATABASE_ADMIN']),
  officeController.deleteOffice
);

// Get all offices with optional pagination and filters
router.get('/all', officeController.getAllOffices);

export default router;
