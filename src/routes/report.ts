import GenerateReportController from '@src/controllers/generateReportController';
import { isStoreKeeperUp } from '@src/middlewares/checkAuth';
import { Router } from 'express';

const router = Router();

const generateReportController = new GenerateReportController();

router.get('/', isStoreKeeperUp, generateReportController.generate);

export default router;
