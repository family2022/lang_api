import express from 'express';
import * as userController from '../controllers/user.controller';
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware';

const router = express.Router();

// Get all users with query, pagination, and filtering
router.get(
  '/all',
  isAuthorized,
  authorizationRole(['DATABASE_ADMIN', 'HEAD']),
  userController.getAllUsers
);

// Get a user by ID
router.get(
  '/:userId',
  isAuthorized,
  authorizationRole(['DATABASE_ADMIN', 'HEAD']),
  userController.getUserById
);

export default router;
