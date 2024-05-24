import deletedController from '@src/controllers/historyController';
import { isAdmin } from '@src/middlewares/checkAuth';

import { Router } from 'express';

const router = Router();

router.get('/', isAdmin, deletedController.getAllDeleted);
// router.get('/:id', isStoreKeeperUp, deletedController.getOneTransaction);

export default router;
