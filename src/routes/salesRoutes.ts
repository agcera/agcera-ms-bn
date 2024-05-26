import { Router } from 'express';
import { isStoreKeeperUp, isStoreKeeper } from '@src/middlewares/checkAuth';
import SalesController from '@src/controllers/salesController';
import { validate, validateParams } from '@src/middlewares/validation';
import { createSaleSchema } from '@src/validation/sales.validation';

const router: Router = Router();
const salesController = new SalesController();

router.get('/', isStoreKeeperUp, salesController.getAllSales);
router.get('/:id', isStoreKeeperUp, validateParams(), salesController.getOneSale);
router.post('/', isStoreKeeper, validate(createSaleSchema), salesController.createSale);
router.patch('/:id', isStoreKeeperUp, validateParams(), salesController.refundSale);

export default router;
