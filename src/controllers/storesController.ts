import StoreServices from '@src/services/store.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Request, Response } from 'express';
import { IncludeOptions, Op } from 'sequelize';
import { BaseController } from '.';
import ProductServices from '@src/services/product.services';
import UserService from '@src/services/user.services';
import { UserRolesEnum } from '@src/types/user.types';
import User from '@database/models/user';

class StoresController extends BaseController {
  async createStore(req: Request, res: Response): Promise<Response> {
    const { name, location, phone, isActive, keepers } = req.body;

    const store = await StoreServices.getOneStore({ [Op.or]: [{ name }, { phone }] });

    if (store?.name === name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Store with this name already exists',
      });
    }
    if (store?.phone === phone) {
      return res.status(400).json({
        status: 'fail',
        message: 'Store with this phone number already exists',
      });
    }

    const Keepers = [];
    for (let i = 0; i < keepers.length; i++) {
      const keeper = await UserService.getOneUser({ id: keepers[i], role: UserRolesEnum.KEEPER });
      if (!keeper) {
        return res.status(404).json({
          status: 'fail',
          message: `Keeper with this '${keepers[i]}'' id not found`,
        });
      } else {
        Keepers.push(keeper);
      }
    }

    const newStore = await StoreServices.create({ name, location, phone, isActive });
    for (let i = 0; i < Keepers.length; i++) {
      const keeper = Keepers[i];
      keeper.storeId = newStore.id;
      await keeper.save();
    }

    return res.status(201).json({
      status: 'success',
      data: newStore,
    });
  }

  // get all shops
  async getStores(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;
    const { search, limit, skip, sort } = req.query;

    const where: any = {};
    const include: any = [];

    if (['keeper', 'user'].includes(user.role)) {
      where.id = user.storeId;
    }

    const { stores, total } = await StoreServices.getAllStores({ search, limit, skip, sort }, where, include);

    return res.status(200).json({
      status: 'success',
      data: { stores, total },
    });
  }

  // get a single store
  async singleStore(req: ExtendedRequest, res: Response): Promise<Response> {
    const { role, storeId } = req.user!;
    const { id } = req.params;

    const store = await StoreServices.getOneStore({ id });

    if (['keeper', 'user'].includes(role) && storeId !== id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not allowed to view this store info',
      });
    }

    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'store not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: store,
    });
  }

  // update store
  async updateStore(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id: userId, role: userRole, storeId: userStoreId } = req.user!;
    const { id: storeId } = req.params;
    const { name, location, phone, isActive, keepers = [] } = req.body;

    const include: IncludeOptions[] = [
      {
        association: 'users',
        required: false,
        where: { id: userId },
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'storeId'] },
      },
    ];
    // get the to be updated store
    const store = await StoreServices.getStoreById(storeId, include);

    // check if the user is a keeper of this store to allow him to update the store
    if (userRole === UserRolesEnum.KEEPER && userStoreId !== storeId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not allowed to update this store details',
      });
    }
    // check if the store exists
    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Shop not found',
      });
    }

    // Stop the operation if we are trying to update the main store name
    if (name && store.name === 'main' && (name || keepers)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You cannot update the main store name or keepers',
      });
    }

    // update the store
    name && (store.name = name);
    phone && (store.phone = phone);
    location && (store.location = location);
    typeof isActive === 'boolean' && (store.isActive = isActive);

    // get another store with the same name or phone number
    const duplicateStore = await StoreServices.getOneStore({
      [Op.or]: [{ name: store.name }, { phone: store.phone }],
      id: { [Op.not]: storeId },
    });

    // provide appropriate error message if it exists
    if (name && duplicateStore?.name === name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Store with this name already exists',
      });
    }
    if (phone && duplicateStore?.phone === phone) {
      return res.status(400).json({
        status: 'fail',
        message: 'Store with this phone number already exists',
      });
    }

    // check if the new keepers exist and have the role of keeper
    const newKeepers = [];
    for (let i = 0; i < keepers.length; i++) {
      const keeper = await UserService.getOneUser({ id: keepers[i], role: UserRolesEnum.KEEPER });
      if (!keeper) {
        return res.status(404).json({
          status: 'fail',
          message: `Keeper with this '${keepers[i]}' id not found`,
        });
      } else {
        newKeepers.push(keeper);
      }
    }

    // save the store
    await store.save();

    // Remove old keepers
    const oldUpdate = (await UserService.bulkUpdateUsers({ role: UserRolesEnum.KEEPER, storeId }, { storeId: null }, [
      'id',
      'storeId',
      'updatedAt',
    ])) as [affectedCount: number, affectedRows: User[]];
    // Add new keepers
    const newUpdate = (await UserService.bulkUpdateUsers(
      { role: UserRolesEnum.KEEPER, id: { [Op.in]: keepers } },
      { storeId },
      ['id', 'storeId', 'updatedAt']
    )) as [affectedCount: number, affectedRows: User[]];
    // Merge the old and new updated keepers
    const updatedUsers = [...oldUpdate[1]].reduce((acc, user) => {
      if (!acc.find((u) => u.id === user.id)) {
        acc.push(user);
      }
      return acc;
    }, newUpdate[1]);

    return res.status(200).json({
      status: 'success',
      data: { store, updatedUsers },
    });
  }

  // delete store
  async deleteStore(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const store = await StoreServices.getStoreById(id);
    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Store not found',
      });
    }

    if (store.name === 'main') {
      return res.status(403).json({
        status: 'fail',
        message: 'You cannot delete the main store',
      });
    }

    // delete the store
    await store.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Store deleted successfully',
    });
  }

  async getStoreProducts(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;
    const { storeId } = req.params;

    if (user.role !== 'admin' && user.storeId !== storeId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not allowed to view this store products',
      });
    }

    const store = await StoreServices.getOneStore({ id: storeId });
    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Store not found',
      });
    }

    const includes: [IncludeOptions] = [
      {
        association: 'stores',
        where: { storeId },
        required: true,
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    ];
    const { products, total } = await ProductServices.getAllProducts(req.query, {}, includes);

    return res.status(200).json({
      status: 'success',
      data: { products, total },
    });
  }

  async getStoreUsers(req: ExtendedRequest, res: Response): Promise<Response> {
    const user = req.user!;
    const { storeId } = req.params;

    if (user.role === 'keeper' && user.storeId !== storeId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not allowed to view this store users',
      });
    }

    const store = await StoreServices.getOneStore({ id: storeId });
    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Store not found',
      });
    }

    const { users, total } = await UserService.getAllUsers(req.query, { storeId });

    return res.status(200).json({
      status: 'success',
      data: { users, total },
    });
  }
}

export default StoresController;
