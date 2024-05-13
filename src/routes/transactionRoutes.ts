import TransactionController from '@src/controllers/transactionController';
import { isStoreKeeperUp } from '@src/middlewares/checkAuth';
import { createTransactionSchema } from '@src/validation/transaction.validation';
import { validate } from '@src/middlewares/validation';
import { Router } from 'express';

const router = Router();
const transactionController = new TransactionController();

router.post('/', isStoreKeeperUp, validate(createTransactionSchema), transactionController.createTransaction);
router.get('/', isStoreKeeperUp, transactionController.getAllTransactions);
router.get('/:id', isStoreKeeperUp, transactionController.getOneTransaction);

export default router;
