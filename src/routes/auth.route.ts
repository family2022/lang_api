import express from 'express';
import * as authController from '../controllers/auth.controller';
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  isAuthorized,
  authorizationRole(['DATABASE_ADMIN']),
  authController.register
);

// Login
router.post('/login', authController.login);

// Update password
router.post('/update-password', isAuthorized, authController.updatePassword);

// Update user
router.put('/update/:userId', isAuthorized, authController.updateUser);

// Delete User
router.delete(
  '/remove/:userId',
  isAuthorized,
  authorizationRole(['DATABASE_ADMIN']),
  authController.removeUser
);

router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

export default router;
