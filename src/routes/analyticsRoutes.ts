import AnalyticsController from '@src/controllers/analyticsController';
import { isStoreKeeperUp } from '@src/middlewares/checkAuth';
import { Router } from 'express';

const router = Router();

const analyticsController = new AnalyticsController();

router.get('/', isStoreKeeperUp, analyticsController.getAnalytics);

export default router;
