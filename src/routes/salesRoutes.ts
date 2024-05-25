import { Router } from 'express';
import { isLoggedIn, isStoreKeeper, isStoreKeeperUp } from '@src/middlewares/checkAuth';
import SalesController from '@src/controllers/salesController';
import { validate, validateParams } from '@src/middlewares/validation';
import { createSaleSchema } from '@src/validation/sales.validation';

const router: Router = Router();
const salesController = new SalesController();

router.get('/', isLoggedIn, salesController.getAllSales);
router.get('/:id', isLoggedIn, validateParams(), salesController.getOneSale);
router.post('/', isStoreKeeper, validate(createSaleSchema), salesController.createSale);
router.patch('/:id', isStoreKeeperUp, validateParams(), salesController.refundSale);

export default router;
