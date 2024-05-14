import { NextFunction, Request, Response } from 'express';
import { BaseMiddleware } from '.';
import { isAdmin } from './checkAuth';

class AllowToCreate extends BaseMiddleware {
  allow(req: Request, res: Response, next: NextFunction) {
    const role = req.body.role;
    if (role == 'keeper' || role == 'admin') {
      return isAdmin(req, res, next);
    }
    req.body.role = 'user';
    next();
  }
}

export default new AllowToCreate().allow;
