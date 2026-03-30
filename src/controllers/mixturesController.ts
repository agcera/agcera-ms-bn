import Product from '@database/models/product';
import MixtureServices from '@src/services/mixture.services';
import { ExtendedRequest } from '@src/types/common.types';
import { handleDeleteUpload, handleUpload } from '@src/utils/cloudinary';
import { UploadApiErrorResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { IncludeOptions, Op } from 'sequelize';
import { BaseController } from '.';
import { recordDeleted } from '@src/services/history.services';

export default class MixturesController extends BaseController {
  async getAllMixtures(req: ExtendedRequest, res: Response): Promise<Response> {
    const { mixtures, total } = await MixtureServices.getAllMixtures(req.query);
    return res.status(200).json({ status: 'success', data: { mixtures, total } });
  }

  async getOneMixture(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const mixture = await MixtureServices.getMixtureByPk(id);
    if (!mixture) {
      return res.status(404).json({ status: 'fail', message: 'Mixture not found' });
    }
    return res.status(200).json({ status: 'success', data: mixture });
  }

  async createMixture(req: Request, res: Response): Promise<Response> {
    const { name, items, costPrice, sellingPrice, description } = req.body;
    const existing = await MixtureServices.getOneMixture({ name });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Mixture with the provided name already exists' });
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
        url = await handleUpload(req.file, 'mixtures');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the mixture image',
        });
      }
    }

    let mixture;
    try {
      mixture = await MixtureServices.createMixture({ name, items, costPrice, sellingPrice, description, image: url });
    } catch (error) {
      return res.status(400).json({ status: 'fail', message: (error as Error).message });
    }

    return res.status(201).json({ status: 'success', data: mixture });
  }

  async updateMixture(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, items, costPrice, sellingPrice, description } = req.body;
    const existingMixture = await MixtureServices.getMixtureByPk(id, [
      { association: 'sales', attributes: ['id'] },
    ] as IncludeOptions[]);
    if (!existingMixture) {
      return res.status(404).json({ status: 'fail', message: 'Mixture not found' });
    }

    if (name) {
      const duplicate = await MixtureServices.getOneMixture({ name, id: { [Op.not]: id } });
      if (duplicate) {
        return res.status(400).json({ status: 'fail', message: 'Mixture with the provided name already exists' });
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
        url = await handleUpload(req.file, 'mixtures');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the mixture image',
        });
      }
    }

    let updated;
    try {
      updated = await MixtureServices.updateMixture(id, {
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
      handleDeleteUpload(existingMixture.image).catch((error) => {
        console.error('Failed to delete the old image', error);
      });
    }

    return res.status(200).json({ status: 'success', data: updated });
  }

  async deleteMixture(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const user = req.user!;
    const existingMixture = await MixtureServices.getMixtureByPk(id, [
      { association: 'sales', attributes: ['id'] },
    ] as IncludeOptions[]);
    if (!existingMixture) {
      return res.status(404).json({ status: 'fail', message: 'Mixture not found' });
    }
    if (existingMixture.sales && existingMixture.sales.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Mixture can no longer be deleted because it has already been used in sales.',
      });
    }

    let mixture;
    try {
      mixture = await MixtureServices.deleteMixture(id);
    } catch (error) {
      return res.status(400).json({ status: 'fail', message: (error as Error).message });
    }

    await recordDeleted({ name: user.name, phone: user.phone }, 'mixture', mixture);

    handleDeleteUpload(mixture.image).catch((error) => {
      console.error('Failed to delete the old image', error);
    });

    return res.status(201).json({ status: 'success', data: 'Mixture deleted successfully', mixture });
  }
}
