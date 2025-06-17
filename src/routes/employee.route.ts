import express from 'express';
import * as employeeController from '../controllers/employee.controller';
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware';

const router = express.Router();

// Create a new employee
router.post(
  '/create',
  isAuthorized,
  authorizationRole(['HR']),
  employeeController.createEmployee
);

// Update an employee
router.put(
  '/update/:employeeId',
  isAuthorized,
  authorizationRole(['HR']),
  employeeController.updateEmployee
);

// Delete an employee
router.delete(
  '/delete/:employeeId',
  isAuthorized,
  authorizationRole(['HR']),
  employeeController.deleteEmployee
);

// Get all employees
router.get(
  '/all',
  isAuthorized,
  authorizationRole(['HR', 'HEAD', 'SYSTEM_ADMIN']),
  employeeController.getAllEmployees
);

// Get employee by ID
router.get(
  '/get/:employeeId',
  isAuthorized,
  authorizationRole(['HR', 'HEAD', 'SYSTEM_ADMIN']),
  employeeController.getEmployeeById
);

export default router;
