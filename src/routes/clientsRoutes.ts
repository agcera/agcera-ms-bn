import { clientsController } from '@src/controllers/clientsController';
import { isStoreKeeperUp } from '@src/middlewares/checkAuth';
import { Router } from 'express';

const router = Router();
const clientController = new clientsController();

router.get('/', isStoreKeeperUp, clientController.getAllClients);

export default router;
