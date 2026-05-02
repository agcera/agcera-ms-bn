import CombosController from '@src/controllers/combosController';
import { isAdmin, isLoggedIn } from '@src/middlewares/checkAuth';
import upload from '@src/middlewares/multer';
import { validate, validateParams } from '@src/middlewares/validation';
import { createComboSchema, updateComboSchema } from '@src/validation/combos.validation';
import { Router } from 'express';

const router = Router();
const combosController = new CombosController();

router.get('/', isLoggedIn, combosController.getAllCombos);
router.get('/:id', isLoggedIn, validateParams(), combosController.getOneCombo);
router.post('/', upload.single('image'), isAdmin, validate(createComboSchema), combosController.createCombo);
router.patch(
  '/:id',
  upload.single('image'),
  isAdmin,
  validateParams(),
  validate(updateComboSchema),
  combosController.updateCombo
);
router.delete('/:id', isAdmin, validateParams(), combosController.deleteCombo);

export default router;
