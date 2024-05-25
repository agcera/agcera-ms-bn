import { UserRolesEnum } from './../types/user.types';
import StoreServices from '@src/services/store.services';
import { ExtendedRequest } from '@src/types/common.types';
import { handleDeleteUpload, handleUpload } from '@src/utils/cloudinary';
import bcrypt from 'bcrypt';
import { UploadApiErrorResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import { BaseController } from '.';
import userService from '../services/user.services';
import { /* defaultTokenExpirySeconds,*/ generateToken, verifyToken } from '../utils/jwtFunctions';
import sendEmail from '../utils/sendEmail';
// import { recordDeleted } from '@src/services/deleted.services';
// import SaleServices from '@src/services/sale.services';

class UsersController extends BaseController {
  async register(req: Request, res: Response): Promise<Response> {
    const { name, email = null, phone, password, storeId, gender, location, role } = req.body;

    // Check if user already exists and was not deleted before
    const user = await userService.getOneUser({ [Op.or]: [{ email }, { phone }], [Op.not]: { email: null } });
    if (user) {
      let message = '';
      if (user.email === email) {
        message = 'Another user with this email already exists.';
      } else if (user.phone === phone) {
        message = 'Another user with this phone number already exists.';
      }

      return res.status(400).json({
        status: 'fail',
        message,
      });
    }

    // Check store exists
    const store = await StoreServices.getStoreById(storeId);
    if (!store || ['expired'].includes(store.name.toLocaleLowerCase())) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Store found with the provided storeId.',
      });
    }
    if (role === 'admin' && store.name !== 'main') {
      return res.status(400).json({
        status: 'fail',
        message: 'An admin can only be registered in the main store.',
      });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, bcrypt.genSaltSync(10));

    // upload the user image and get the url
    let url: string | null = null;
    if (req.file) {
      try {
        url = await handleUpload(req.file, 'users');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the user image',
        });
      }
    } else {
      return res.status(400).json({
        status: 'fail',
        message: 'No image found; Please provide the user image',
      });
    }

    // check create the user
    const image = url!;
    const newUser = await userService.registerUser(
      name,
      hashedPassword,
      email,
      phone,
      gender,
      location,
      storeId,
      role,
      image
    );

    // return the new user
    return res.status(200).json({
      status: 'success',
      data: newUser,
    });
  }

  // login the user
  async Login(req: Request, res: Response): Promise<Response> {
    const { phone, password } = req.body;

    // check if the user exists and login the user
    const user = await userService.loginUser(phone);

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid credentials',
      });
    }

    // compare the password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid credentials',
      });
    }

    // generate the toke for the user
    const tokenDuration = 7 * 24 * 60 * 60;
    const token = generateToken({ id: user.id, role: user.role }, tokenDuration);
    // store the token in the cookies
    // multiply by 1000 to convert to milliseconds as the expiresIn is in seconds
    res.cookie('AuthToken', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: tokenDuration * 1000 });
    res.cookie('AuthTokenExists', true, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: tokenDuration * 1000,
    });

    delete (user.dataValues as { [key: string]: any }).password;

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  }

  // logout the user
  async Logout(req: Request, res: Response): Promise<Response> {
    res.clearCookie('AuthToken');
    res.clearCookie('AuthTokenExists');

    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  }

  // forgot password
  async ForgotPasword(req: Request, res: Response): Promise<Response> {
    const email = req.body.email;

    // check the user exists
    const user = await userService.getOneUser({ email });

    if (user) {
      // If no user found do nothing, this is to prevent information leakage about our user emails 😝
      // generate the token
      const token = generateToken({ id: user.id }, 15 * 60 * 60);

      // send the token to the user's email
      const emailSent = await sendEmail(
        email,
        'Password Reset',
        `Follow the link below to reset your password:\n${process.env.FRONTEND_URL}/${process.env.FRONTEND_RESET_PATH || '/rest-password'}/${token}\n\nThis link will expire in 15 minutes.`
      );

      if (!emailSent) {
        return res.status(500).json({
          status: 'fail',
          message: 'Error sending email. Please try again later.',
        });
      }
    }

    // send the token to the user's phone number
    return res.status(200).json({
      status: 'success',
      message: 'An email with instructions to reset your password has been sent to your email.',
    });
  }

  // reset password
  async resetPassword(req: Request, res: Response): Promise<Response> {
    // get the token from  params
    const { token } = req.params;
    const password = req.body.password;

    // verify the token
    const decoded_token = verifyToken(token);
    if (!decoded_token) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid token',
      });
    }

    const { id }: { [key: string]: any } = decoded_token;

    // get the user using the id
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User assigned to this token not found',
      });
    }

    // hash the new password
    if (!password) {
      return res.status(400).json({
        status: 'fail',
        message: 'New Password is required',
      });
    }

    const hashedPassword = await bcrypt.hash(password, bcrypt.genSaltSync(10));

    // update the password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  }

  // get all users
  async getAllUsers(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;

    let where: WhereOptions = {};
    if (user.role === 'keeper') {
      where = { [Op.or]: [{ role: UserRolesEnum.USER }, { storeId: user.storeId }] };
    }

    const { users, total } = await userService.getAllUsers(req.query, where);

    return res.status(200).json({
      status: 'success',
      data: { users, total },
    });
  }

  // get single user profile
  async getSingleUser(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;
    const { id } = req.params;

    const foundUser = await userService.getUserById(id);

    if (user.role === 'user' && user.id !== id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only request your account',
      });
    } else if (
      user.role === 'keeper' &&
      foundUser?.role !== UserRolesEnum.USER &&
      user.storeId !== foundUser?.storeId
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this user account or user does not exist',
      });
    }

    if (!foundUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: foundUser,
    });
  }

  // get logged in user profile
  async getProfile(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  }

  // update user profile
  async updateUser(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, email, phone, storeId, location, gender } = req.body;

    const user = await userService.getUserById(id);
    if (
      ([UserRolesEnum.USER].includes(req.user!.role) && user?.id !== req.user!.id) ||
      req.user!.role === UserRolesEnum.KEEPER
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'You can not edit the details of this user',
      });
    }
    if (req.user!.role !== UserRolesEnum.ADMIN && storeId && user?.storeId !== storeId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Only the admin can move users between stores.',
      });
    }
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Check if email or phone are already taken
    const duplicateUser = await userService.getOneUser({ [Op.or]: [{ email }, { phone }], [Op.not]: { id } });
    if (duplicateUser) {
      let message = '';
      if (duplicateUser.email === email) {
        message = 'Another user with this email already exists.';
      } else if (duplicateUser.phone === phone) {
        message = 'Another user with this phone number already exists.';
      }

      return res.status(400).json({
        status: 'fail',
        message,
      });
    }

    // Check store exists
    const store = await StoreServices.getStoreById(storeId);
    if (storeId && (!store || store.name === 'expired')) {
      return res.status(400).json({
        status: 'fail',
        message: 'No Store found with the provided storeId.',
      });
    }
    if (user.role === 'admin' && storeId && store?.name !== 'main') {
      return res.status(400).json({
        status: 'fail',
        message: 'An admin can only be registered in the main store.',
      });
    }

    // upload the new image
    let url: string | null = null;
    if (req.file) {
      try {
        url = await handleUpload(req.file, 'users');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the product image',
        });
      }
    }

    // capture the image of the previouse product before saving the new one
    const previousUserimage = user.image;

    name ? (user.name = name) : null;
    email ? (user.email = email) : null;
    phone ? (user.phone = phone) : null;
    storeId ? (user.storeId = storeId) : null;
    location ? (user.location = location) : null;
    gender ? (user.gender = gender) : null;
    url ? (user.image = url) : null;

    await user.save();

    if (url) {
      // No need to bother catching the error as the image is already updated
      handleDeleteUpload(previousUserimage).catch((error) => {
        console.error('Failed to delete the old image', error);
      });
    }

    delete (user.dataValues as { [key: string]: any }).password;

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  }

  // delete user
  async deleteUser(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;
    const { id } = req.params;

    const foundUser = await userService.getOneUser({ id });
    if (!foundUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
    // get the user role that will be deleted
    const userRole = foundUser.role;

    // if the role tobe deleted is not user, be consious
    if (userRole !== 'user') {
      // check if the logged in user is admin
      if (user.role !== 'admin') {
        return res.status(403).json({
          status: 403,
          message: 'You are not allowed to delete this user',
        });
      }
      if (user.id === id) {
        return res.status(403).json({
          status: 'fail',
          message: 'You cannot delete yourself, ask another admin to delete your account',
        });
      }
    } else {
      if (user.role !== UserRolesEnum.ADMIN && user.id !== id) {
        return res.status(403).json({
          status: 403,
          message: 'You are only allowed to delete your account',
        });
      }
    }

    // find all sales which contain the clientId of useId and update them to null
    // await SaleServices.bulkUpdateSale({ clientId: foundUser.id }, { clientId: null });

    // delete the user
    await foundUser.destroy();

    // record in the deleted users
    // await recordDeleted({name: user.name, phone: user.phone}, 'user', foundUser);

    // No need to bother catching the error as the image is already updated
    handleDeleteUpload(foundUser.image).catch((error) => {
      console.error('Failed to delete the old image', error);
    });

    return res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      user: foundUser,
    });
  }
}

export default UsersController;
