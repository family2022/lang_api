import express from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware';

const router = express.Router();

// Create feedback
router.post('/create', feedbackController.createFeedback);

// Update feedback
router.put(
  '/update/:feedbackId',
  isAuthorized,
  feedbackController.updateFeedback
);

// Delete feedback
router.delete(
  '/delete/:feedbackId',
  isAuthorized,
  authorizationRole(['HEAD']),
  feedbackController.deleteFeedback
);

// Get all feedback
router.get(
  '/all',
  isAuthorized,
  authorizationRole(['HEAD']),
  feedbackController.getAllFeedbacks
);

// Get feedback by ID
router.get(
  '/get/:feedbackId',
  isAuthorized,
  authorizationRole(['HEAD']),
  feedbackController.getFeedbackById
);

export default router;
