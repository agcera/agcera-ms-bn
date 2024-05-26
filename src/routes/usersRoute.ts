import upload from '@src/middlewares/multer';
import { validate, validateParams } from '@src/middlewares/validation';
import {
  emailSchema,
  passwordSchema,
  userLoginSchema,
  userRegisterSchema,
  userUpdateSchema,
} from '@src/validation/user.validation';
import { Router } from 'express';
import UsersController from '../controllers/usersController';
import { isAdmin, isStoreKeeperUp } from '../middlewares/checkAuth';

const router: Router = Router();
const usersController = new UsersController();

router.post('/register', upload.single('image'), isAdmin, validate(userRegisterSchema), usersController.register);
router.post('/login', validate(userLoginSchema), usersController.Login);
router.post('/forgot', validate(emailSchema), usersController.ForgotPasword);
router.put('/reset/:token', validate(passwordSchema), usersController.resetPassword);
router.post('/logout', usersController.Logout);

router.get('/', isAdmin, usersController.getAllUsers);
router.get('/me', isStoreKeeperUp, usersController.getProfile);
router.get('/:id', isAdmin, validateParams(), usersController.getSingleUser);
router.patch(
  '/:id',
  upload.single('image'),
  isAdmin,
  validateParams(),
  validate(userUpdateSchema),
  usersController.updateUser
);
router.delete('/:id', isAdmin, validateParams(), usersController.deleteUser);

export default router;
