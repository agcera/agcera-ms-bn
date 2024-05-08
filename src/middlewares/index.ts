import { NextFunction, Request, Response } from 'express';

export class BaseMiddleware {
  // Here we are wrapping every method of the class that extends this BaseController with a try-catch block.
  constructor() {
    return new Proxy(this, {
      get: function (target: any, propKey: string, receiver: ProxyConstructor) {
        const originalMethod = target[propKey];
        if (typeof originalMethod === 'function') {
          return async (req: Request, res: Response, next: NextFunction, ...args: any) => {
            try {
              return await originalMethod.apply(this, [req, res, next, ...args]);
            } catch (error) {
              return next(error);
            }
          };
        } else {
          return Reflect.get(target, propKey, receiver);
        }
      },
    });
  }
}
