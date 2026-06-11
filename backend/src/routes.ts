import { Router } from 'express';
import authRouter from './modules/auth/auth.router';
import userRouter from './modules/user/user.router';
import barangayRouter from './modules/barangay/barangay.router';
import diseaseRouter from './modules/disease/disease.router';
import caseRouter from './modules/case/case.router';
import riskReportRouter from './modules/risk-report/risk-report.router';
import alertRouter from './modules/alert/alert.router';
import feedbackRouter from './modules/feedback/feedback.router';
import predictionRouter from './modules/prediction/prediction.router';
import dashboardRouter from './modules/dashboard/dashboard.router';
import exportRouter from './modules/export/export.router';
import publicRouter from './modules/public/public.router';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'ok', data: { timestamp: new Date().toISOString() } });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/barangays', barangayRouter);
router.use('/diseases', diseaseRouter);
router.use('/cases', caseRouter);
router.use('/reports', riskReportRouter);
router.use('/alerts', alertRouter);
router.use('/feedback', feedbackRouter);
router.use('/predictions', predictionRouter);
router.use('/dashboard', dashboardRouter);
router.use('/exports', exportRouter);
router.use('/public', publicRouter);

export default router;
