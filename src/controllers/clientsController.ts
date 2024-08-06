import { BaseMiddleware } from '@src/middlewares';
import CleintServices from '@src/services/client.services';
import { Request, Response } from 'express';

export class clientsController extends BaseMiddleware {
  public async getAllClients(req: Request, res: Response): Promise<Response> {
    const clients = await CleintServices.getClients();
    return res.status(200).json({
      status: 'success',
      data: clients,
    });
  }
}
