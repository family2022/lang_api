import { Router, Request, Response, NextFunction } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import landRoutes from './land.route';
import landOwnerRoutes from './landOwner.route';
import appointmentRoutes from './appointment.route';
import announcementRoute from './announcement.route';
import feedbackRoute from './feedback.route';
import employeeRoute from './employee.route';
import officeRoute from './office.route';
import userReport from './user-report.route';

const router = Router();

router.get('/test', (req: Request, res: Response, next: NextFunction): any => {
  return res.send('OK');
});
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/land', landRoutes);
router.use('/land/owner', landOwnerRoutes);
router.use('/appointment', appointmentRoutes);
router.use('/announcement', announcementRoute);
router.use('/feedback', feedbackRoute);
router.use('/employee', employeeRoute);
router.use('/office', officeRoute);
router.use('/user-report', userReport);

export default router;
