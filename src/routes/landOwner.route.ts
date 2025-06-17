import express from 'express';
import * as landControllers from '../controllers/landOwner.controller'; // Import all controllers as landControllers
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware'; // Assuming you have an authorization middleware
import { uploadNationalId } from '../middlewares/nationalIDUpload.middleware';

const router = express.Router();

// Create a new LandOwner
router.post(
  '/create',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN']),
  uploadNationalId,
  landControllers.createLandOwner
);

// Update an existing LandOwner
router.put(
  '/update/:ownerId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN']),
  uploadNationalId,
  landControllers.updateLandOwner
);

// Delete a LandOwner
router.delete(
  '/remove/:ownerId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN']),
  landControllers.deleteLandOwner
);

// Get all LandOwners
router.get(
  '/all',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER', 'OTHER']),
  landControllers.getAllLandOwners
);

// Get a specific LandOwner by ID
router.get(
  '/get/:ownerId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER', 'OTHER']),
  landControllers.getLandOwnerById
);

// Get land transfer history for a specific LandOwner
router.get(
  '/land/history/:ownerId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER']),
  landControllers.getLandHistoryByLandOwnerId
);

export default router;
