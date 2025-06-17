import express from 'express';
import * as announcementController from '../controllers/announcement.controller';
import {
  authorizationRole,
  isAuthorized,
  probablyAuthorized,
} from '../middlewares/auth.middleware';

const router = express.Router();

// Create a new announcement
router.post(
  '/create',
  isAuthorized,
  authorizationRole(['HEAD', 'SYSTEM_ADMIN', 'OFFICER']),
  announcementController.createAnnouncement
);

// Update an announcement
router.put(
  '/update/:announcementId',
  isAuthorized,
  authorizationRole(['HEAD', 'SYSTEM_ADMIN', 'OFFICER']),
  announcementController.updateAnnouncement
);

// Delete an announcement
router.delete(
  '/delete/:announcementId',
  isAuthorized,
  authorizationRole(['HEAD', 'SYSTEM_ADMIN', 'OFFICER']),
  announcementController.deleteAnnouncement
);

// Get all announcements
router.get(
  '/all',
  probablyAuthorized,
  announcementController.getAllAnnouncements
);

// Get announcement by ID
router.get('/get/:announcementId', announcementController.getAnnouncementById);

export default router;
