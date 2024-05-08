import UserService from '@src/services/user.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Request, type NextFunction, type Response } from 'express';
import { BaseMiddleware } from '.';
import { verifyToken } from '../utils/jwtFunctions';

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
    let decoded_token: Record<string, unknown>;
    try {
      decoded_token = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid Token supplied! Please Login again!',
      });
    }

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
