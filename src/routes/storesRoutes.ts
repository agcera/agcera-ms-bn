import { Router } from 'express';
import StoreController from '../controllers/storesController';
import { isAdmin, isStoreKeeperUp } from '@src/middlewares/checkAuth';
import { validate, validateParams } from '@src/middlewares/validation';
import { addProductToStoreSchema, storeRegisterSchema, storeUpdateSchema } from '@src/validation/store.validation';

const router = Router();
const storesController = new StoreController();

router.post('/', isAdmin, validate(storeRegisterSchema), storesController.createStore);
router.get('/', isStoreKeeperUp, storesController.getStores);
router.get('/all', storesController.getAllStoresNamesAndLocations);

router.get('/:id', isStoreKeeperUp, validateParams(), storesController.singleStore);
router.patch('/:id', isAdmin, validateParams(), validate(storeUpdateSchema), storesController.updateStore);
router.delete('/:id', isAdmin, validateParams(), storesController.deleteStore);

router.get('/:storeId/products', isStoreKeeperUp, validateParams(), storesController.getStoreProducts);
router.get('/:storeId/users', isStoreKeeperUp, validateParams(), storesController.getStoreUsers);

router.post('/addProduct', isAdmin, validate(addProductToStoreSchema), storesController.addProductToStore);

export default router;
