import StoreServices from '@src/services/store.services';
import { ExtendedRequest } from '@src/types/common.types';
import { Request, Response } from 'express';
import { IncludeOptions, Op } from 'sequelize';
import { BaseController } from '.';
import ProductServices from '@src/services/product.services';
import UserService from '@src/services/user.services';
import { UserRolesEnum } from '@src/types/user.types';
import User from '@database/models/user';
import StoreProduct from '@database/models/storeproduct';
import ProductsMovement from '@database/models/productsmovement';
import { recordDeleted } from '@src/services/deleted.services';

class StoresController extends BaseController {
  async createStore(req: Request, res: Response): Promise<Response> {
    const { name, location, phone, isActive, keepers } = req.body;

    const store = await StoreServices.getOneStore({ [Op.or]: [{ name }, { phone }] });

    if (store?.name === name || ['main', 'expired'].includes(name.toLowerCase())) {
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
    if (name && ['main', 'expired'].includes(store.name.toLowerCase()) && (name || keepers)) {
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
  async deleteStore(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;

    // const include: IncludeOptions[] = [
    //   {
    //     association: 'products',
    //   },
    // ];

    const store = await StoreServices.getStoreById(id);
    if (!store) {
      return res.status(404).json({
        status: 'fail',
        message: 'Store not found',
      });
    }

    if (['main', 'expired'].includes(store.name.toLowerCase())) {
      return res.status(403).json({
        status: 'fail',
        message: "This store can't be deleted",
      });
    }

    // move all products from the store to be deleted to main store
    // an object of product ids and their quantities from the store to be deleted
    const productsWithIds = store?.products?.map((p) => ({ productId: p.productId, quantity: p.quantity }));

    // increment the products of the main store for each product id in the productsWithIds

    const mainStore = await StoreServices.getOneStore({ name: 'main' });

    if (productsWithIds)
      for (let i = 0; i < productsWithIds.length; i++) {
        const { productId, quantity } = productsWithIds[i];
        await StoreProduct.increment({ quantity }, { where: { storeId: mainStore!.id, productId } });
      }

    // delete the store
    await store.destroy();

    // record to the deleted table
    await recordDeleted(req.user!.id, 'store', store);

    return res.status(200).json({
      status: 'success',
      message: 'Store deleted successfully',
      store,
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

    const includes: IncludeOptions[] = [];
    if (user.role !== UserRolesEnum.USER) {
      includes.push({
        association: 'stores',
        where: { storeId },
        required: true,
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        include: [{ association: 'store', attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] } }],
      });
    }
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

  // admin add product to store
  async addProductToStore(req: ExtendedRequest, res: Response): Promise<Response> {
    const { productId, quantity, from, to } = req.body;

    // check if the stores we want to take froma nd to exist

    // check from and bring it with products association
    const include: IncludeOptions[] = [
      {
        association: 'products',
        include: [
          {
            association: 'product',
          },
        ],
      },
    ];

    let fromStore = null;
    let toStore = null;

    if (from !== 'main') {
      fromStore = await StoreServices.getOneStore({ id: from }, include);
    } else {
      fromStore = await StoreServices.getOneStore({ name: from }, include);
    }

    if (!fromStore) {
      return res.status(404).json({
        status: 404,
        message: `Source Store ${from} not found`,
      });
    }

    // check for the to store
    if (to !== 'expired') {
      toStore = await StoreServices.getOneStore({ id: to }, include);
    } else {
      toStore = await StoreServices.getOneStore({ name: to }, include);
    }

    if (!toStore) {
      return res.status(404).json({
        status: 404,
        message: `Destination Store ${to} not found`,
      });
    }

    const mainMovement = fromStore?.name === 'main' && toStore?.name === 'main';

    // check if the product exists in the source store and check if the quantity is available
    const product = fromStore?.products?.find((p) => p.productId === productId);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: `Product not found in the source store ${fromStore.name}`,
      });
    }

    if (!mainMovement && (product.quantity < quantity || product.quantity - quantity < 1)) {
      return res.status(400).json({
        status: 400,
        message: `The quantity of Product ${product.product.name} not available in the source store ${fromStore.name}`,
      });
    }

    // increment the products of the destinatin store

    const addProducts = await StoreProduct.increment({ quantity }, { where: { storeId: toStore?.id, productId } });

    if (!addProducts) {
      return res.status(400).json({
        status: 400,
        message: `Product ${product.product.name} not added to store ${toStore?.name}`,
      });
    }

    // decrement the products of the source store if we are not moving products from main to main

    if (mainMovement) {
      return res.status(201).json({
        status: 201,
        message: `Product added to store ${toStore?.name} from ${fromStore?.name} successfully`,
        data: addProducts,
      });
    }

    await StoreProduct.increment({ quantity: -quantity }, { where: { storeId: fromStore?.id, productId } });

    // record the movement in the products movement table
    await ProductsMovement.create({
      quantity,
      productId,
      userId: req.user?.id,
      from: fromStore?.id,
      to: toStore?.id,
    });

    return res.status(201).json({
      status: 201,
      message: `Product added to store ${toStore?.name} from ${fromStore?.name} successfully`,
      data: addProducts,
    });
  }

  // get all stores name and location
  async getAllStoresNamesAndLocations(Req: ExtendedRequest, res: Response): Promise<Response> {
    const stores = await StoreServices.getAllStoresNameAndLocation();

    return res.status(200).json({
      status: 200,
      data: stores,
    });
  }
}

export default StoresController;
