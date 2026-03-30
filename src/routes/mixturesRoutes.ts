import MixturesController from '@src/controllers/mixturesController';
import { isAdmin, isLoggedIn } from '@src/middlewares/checkAuth';
import upload from '@src/middlewares/multer';
import { validate, validateParams } from '@src/middlewares/validation';
import { createMixtureSchema, updateMixtureSchema } from '@src/validation/mixtures.validation';
import { Router } from 'express';

const router = Router();
const mixturesController = new MixturesController();

router.get('/', isLoggedIn, mixturesController.getAllMixtures);
router.get('/:id', isLoggedIn, validateParams(), mixturesController.getOneMixture);
router.post('/', upload.single('image'), isAdmin, validate(createMixtureSchema), mixturesController.createMixture);
router.patch(
  '/:id',
  upload.single('image'),
  isAdmin,
  validateParams(),
  validate(updateMixtureSchema),
  mixturesController.updateMixture
);
router.delete('/:id', isAdmin, validateParams(), mixturesController.deleteMixture);

export default router;
