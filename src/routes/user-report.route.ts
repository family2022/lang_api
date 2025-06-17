import express from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} from '../controllers/user-report.controller';
import { isAuthorized } from '../middlewares/auth.middleware';

const router = express.Router();

// Route to create a new report
router.post('/create', isAuthorized, createReport);

// Route to get all reports with optional filters
router.get('/all', isAuthorized, getReports);

// Route to get a report by ID
router.get('/get/:reportId', isAuthorized, getReportById);

// Route to update a report by ID
router.put('/update/:reportId', isAuthorized, updateReport);

// Route to delete a report by ID
router.delete('/delete/:reportId', isAuthorized, deleteReport);

export default router;
