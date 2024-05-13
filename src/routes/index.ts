import { Router } from 'express';
import productsRoutes from './productsRoutes';
import salesRoutes from './salesRoutes';
import storesRoutes from './storesRoutes';
import usersRoute from './usersRoute';
import { validateQueries } from '@src/middlewares/validation';
import generateReport from './report';
import transactionRoutes from './transactionRoutes';

const router = Router();

// Register the always used middlewares
router.use(validateQueries);

router.use('/users', usersRoute);
router.use('/stores', storesRoutes);
router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);
router.use('/report', generateReport);
router.use('/transaction', transactionRoutes);

router.post('/error', () => {
  throw new Error('This is an error');
});

export default router;
