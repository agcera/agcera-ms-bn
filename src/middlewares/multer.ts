import multer from 'multer';
import { BaseMiddleware } from '.';
import { NextFunction, Request, Response } from 'express';

export class MulterMiddleware extends BaseMiddleware {
  upload = {
    single: (name: string): any => {
      return (req: Request, res: Response, next: NextFunction) => {
        try {
          const multerRes = multer({
            storage: multer.memoryStorage(),
            fileFilter: (req, file, cb) => {
              if (file.mimetype.startsWith('image')) {
                cb(null, true);
              } else {
                cb(new Error('Not an image! Please upload only images.'));
              }
            },
            limits: {
              fileSize: 5 * 1024 * 1024, // 10MB
            },
          }).single(name)(req, res, next);

          return multerRes;
        } catch (err: any) {
          return res.status(400).json({
            status: 'fail',
            message: err.message,
          });
        }
      };
    },
  };
}

export default new MulterMiddleware().upload;
