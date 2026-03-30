import { NextFunction, Response, Request } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('\x1b[31mError ===> \n\x1b[37m', err);
  }

  return res.status(500).json({
    status: 'fail',
    message: 'An Unexpected error occurred. Please try again later.',
  });
};

export const validationError = (err: Error, res: Response) => {
  return res.status(400).json({
    status: 'fail',
    message: err.message,
  });
};
