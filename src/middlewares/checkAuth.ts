import UserService from '@src/services/user.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Request, type NextFunction, type Response } from 'express';
import { BaseMiddleware } from '.';
import { generateToken, verifyToken } from '../utils/jwtFunctions';
import Store from '@database/models/store';

export class AuthMiddleware extends BaseMiddleware {
  requiredRole: string | Array<string>;

  constructor(requiredRole: string | Array<string>) {
    super();
    this.requiredRole = requiredRole;
  }

  checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    // throw new Error('Method not implemented.');
    // Extract the token from cookies
    const token = req.cookies.AuthToken;

    // Check if the token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized. Please Login!',
      });
    }

    // If the token exists, decode and verify it
    let decoded_token: Record<string, any>;
    try {
      decoded_token = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid Token supplied! Please Login again!',
      });
    }

    console.log(decoded_token.iat, 'decoded_token');

    // If the token exists, every 10 minutes generate a new token that shall expire in an hour
    // This is to keep the user logged in for a long time and log him out after an hour of inactivity

    const { id } = decoded_token;

    // Check if the user exists
    if (!id) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid Token supplied! Please Login again!',
      });
    }

    const user = await UserService.getUserById(id as string);

    // Check if the user exists
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized. Please Login!',
      });
    }

    // check if the user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact the admin!',
      });
    }

    // check if the store is active
    if (user.storeId) {
      const store = await Store.findByPk(user.storeId);
      if (!store?.isActive && user.role !== 'admin') {
        return res.status(401).json({
          status: 'fail',
          message: 'Your store has been deactivated. Please contact the admin!',
        });
      }
    }

    if (Date.now() - decoded_token.iat * 1000 > 60000) {
      const tokenDuration = 1 * 60 * 60;
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
    }

    // If only checking if the user is logged in
    if (this.requiredRole === '*') {
      (req as ExtendedRequest).user = user;
      return next();
    }

    // Check if the user has the required role
    if (Array.isArray(this.requiredRole) ? this.requiredRole.includes(user.role) : user.role === this.requiredRole) {
      (req as ExtendedRequest).user = user;
      return next();
    }

    return res.status(403).json({
      status: 'fail',
      message: 'You are not authorized to perform this action',
    });
  };
}

export const isAdmin = new AuthMiddleware('admin').checkAuth;
export const isStoreKeeper = new AuthMiddleware('keeper').checkAuth;
export const isUser = new AuthMiddleware('user').checkAuth;

// You can also check for any role you wish

// use the same check role to simply check if the user is logged in
export const isLoggedIn = new AuthMiddleware('*').checkAuth;

// In addition you can check for multiple roles
export const isStoreKeeperUp = new AuthMiddleware(['keeper', 'admin']).checkAuth;
