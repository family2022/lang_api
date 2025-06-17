import express from 'express';
import * as landController from '../controllers/land.controller';
import * as landFileController from '../controllers/landFile.controller';
import * as landTransferController from '../controllers/landTransferFile.controller';
import {
  authorizationRole,
  isAuthorized,
} from '../middlewares/auth.middleware';
import { uploadMultipleFiles } from '../middlewares/upload.middleware';

const router = express.Router();

// Create a new land
router.post(
  '/create',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK']),
  landController.createLand
);

// Update existing land
router.put(
  '/update/:landId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK']),
  landController.updateLand
);

// Delete a land
router.delete(
  '/remove/:landId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK']),
  landController.deleteLand
);

// Transfer land ownership
router.post(
  '/transfer',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN']),
  landController.transferLandOwnership
);

// Get all lands (with optional filtering by landOwnerId)
router.get(
  '/all',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER', 'OTHER']),
  landController.getAllLands
);

// Get a specific land by ID
router.get(
  '/get/:landId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER', 'OTHER']),
  landController.getLandById
);

// Get land transfer history by landId
router.get(
  '/transfer/history/:landId',
  isAuthorized,
  landController.getLandTransferHistoryByLandId
);

// Upload land files
router.post(
  '/file/create/:landId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK']),
  uploadMultipleFiles,
  landFileController.createLandFiles
);

// Delete a land file by ID
router.delete(
  '/file/remove/:landFileId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK']),
  landFileController.deleteLandFile
);

// Get all land files by landId
router.get(
  '/file/all/:landId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER']),
  landFileController.getAllLandFilesByLandId
);

// Upload land transfer file
router.post(
  '/transfer/file/create/:landTransferId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK']),
  uploadMultipleFiles,
  landTransferController.createLandTransferFiles
);

// Delete a land transfer file by ID
router.delete(
  '/transfer/file/remove/:landTransferFileId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK']),
  landTransferController.deleteLandTransferFile
);

// Get all land transfer files by landTransferId
router.get(
  '/transfer/file/all/:landTransferId',
  isAuthorized,
  authorizationRole(['SYSTEM_ADMIN', 'LAND_BANK', 'HEAD', 'OFFICER']),
  landTransferController.getAllLandTransferFilesByLandTransferId
);
export default router;
