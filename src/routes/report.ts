import { Router } from 'express';
import GenerateReportController from '@src/controllers/generateReportController';

const router = Router();

router.get('/', GenerateReportController.generate);

export default router;
