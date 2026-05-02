import Product from '@database/models/product';
import ComboServices from '@src/services/combo.services';
import { ExtendedRequest } from '@src/types/common.types';
import { handleDeleteUpload, handleUpload } from '@src/utils/cloudinary';
import { UploadApiErrorResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { IncludeOptions, Op } from 'sequelize';
import { BaseController } from '.';
import { recordDeleted } from '@src/services/history.services';
import { UserRolesEnum } from '@src/types/user.types';

export default class CombosController extends BaseController {
  async getAllCombos(req: ExtendedRequest, res: Response): Promise<Response> {
    const isAdmin = req.user?.role === UserRolesEnum.ADMIN;
    const { combos, total } = await ComboServices.getAllCombos(req.query, undefined, undefined, isAdmin);
    return res.status(200).json({ status: 'success', data: { combos, total } });
  }

  async getOneCombo(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const isAdmin = req.user?.role === UserRolesEnum.ADMIN;
    const combo = await ComboServices.getComboByPk(id, undefined, isAdmin);
    if (!combo) {
      return res.status(404).json({ status: 'fail', message: 'Combo not found' });
    }
    return res.status(200).json({ status: 'success', data: combo });
  }

  async createCombo(req: ExtendedRequest, res: Response): Promise<Response> {
    const { name, items, costPrice, sellingPrice, description } = req.body;
    const existing = await ComboServices.getOneCombo({ name }, undefined, true);
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Combo with the provided name already exists' });
    }

    const productIds = (items || []).map((item: any) => item.productId);
    if (productIds.length) {
      const products = await Product.findAll({ where: { id: { [Op.in]: productIds } }, attributes: ['id'] });
      if (products.length !== productIds.length) {
        return res.status(400).json({ status: 'fail', message: 'Some products selected were not found' });
      }
    }

    let url: string | null = null;
    if (req.file) {
      try {
        url = await handleUpload(req.file, 'combos');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the combo image',
        });
      }
    }

    let combo;
    try {
      combo = await ComboServices.createCombo({ name, items, costPrice, sellingPrice, description, image: url });
    } catch (error) {
      return res.status(400).json({ status: 'fail', message: (error as Error).message });
    }

    return res.status(201).json({ status: 'success', data: combo });
  }

  async updateCombo(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, items, costPrice, sellingPrice, description } = req.body;
    const existingCombo = await ComboServices.getComboByPk(
      id,
      [{ association: 'sales', attributes: ['id'] }] as IncludeOptions[],
      true
    );
    if (!existingCombo) {
      return res.status(404).json({ status: 'fail', message: 'Combo not found' });
    }

    if (name) {
      const duplicate = await ComboServices.getOneCombo({ name, id: { [Op.not]: id } }, undefined, true);
      if (duplicate) {
        return res.status(400).json({ status: 'fail', message: 'Combo with the provided name already exists' });
      }
    }

    if (items?.length) {
      const productIds = items.map((item: any) => item.productId);
      const products = await Product.findAll({ where: { id: { [Op.in]: productIds } }, attributes: ['id'] });
      if (products.length !== productIds.length) {
        return res.status(400).json({ status: 'fail', message: 'Some products selected were not found' });
      }
    }

    let url: string | null = null;
    if (req.file) {
      try {
        url = await handleUpload(req.file, 'combos');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the combo image',
        });
      }
    }

    let updated;
    try {
      updated = await ComboServices.updateCombo(id, {
        name,
        costPrice,
        sellingPrice,
        description,
        image: url,
        items,
      });
    } catch (error) {
      return res.status(400).json({ status: 'fail', message: (error as Error).message });
    }

    if (url) {
      handleDeleteUpload(existingCombo.image).catch((error) => {
        console.error('Failed to delete the old image', error);
      });
    }

    return res.status(200).json({ status: 'success', data: updated });
  }

  async deleteCombo(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const user = req.user!;
    const existingCombo = await ComboServices.getComboByPk(
      id,
      [{ association: 'sales', attributes: ['id'] }] as IncludeOptions[],
      true
    );
    if (!existingCombo) {
      return res.status(404).json({ status: 'fail', message: 'Combo not found' });
    }
    if (existingCombo.sales && existingCombo.sales.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Combo can no longer be deleted because it has already been used in sales.',
      });
    }

    let combo;
    try {
      combo = await ComboServices.deleteCombo(id);
    } catch (error) {
      return res.status(400).json({ status: 'fail', message: (error as Error).message });
    }

    await recordDeleted({ name: user.name, phone: user.phone }, 'combo', combo);

    handleDeleteUpload(combo.image).catch((error) => {
      console.error('Failed to delete the old image', error);
    });

    return res.status(201).json({ status: 'success', data: 'Combo deleted successfully', combo });
  }
}
