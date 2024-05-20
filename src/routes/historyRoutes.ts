import deletedController from '@src/controllers/deletedController';
import historyController from '@src/controllers/historyController';
import { isStoreKeeperUp } from '@src/middlewares/checkAuth';

import { Router } from 'express';

const router = Router();

router.get('/deleted', isStoreKeeperUp, historyController.getAllDeleted);
router.get('/deleted/:id', isStoreKeeperUp, deletedController.getDeletedItemById);
router.get('/movements', isStoreKeeperUp, historyController.getProductsMovements);

export default router;
