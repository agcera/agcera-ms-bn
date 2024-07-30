import ProductServices from '@src/services/product.services';
import VariationServices from '@src/services/variation.services';
import { ExtendedRequest } from '@src/types/common.types';
import { ProductTypesEnum } from '@src/types/product.types';
import { UserRolesEnum } from '@src/types/user.types';
import { handleDeleteUpload, handleUpload } from '@src/utils/cloudinary';
import { UploadApiErrorResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { IncludeOptions, Op, WhereOptions } from 'sequelize';
import { BaseController } from '.';
import Variation from '@database/models/variation';
// import Product from '@database/models/product';
// import { recordDeleted } from '@src/services/deleted.services';

export default class ProductsController extends BaseController {
  // get all products
  async getAllProducts(req: ExtendedRequest, res: Response): Promise<Response> {
    const isAdmin = req.user?.role === UserRolesEnum.ADMIN;
    const { products, total } = await ProductServices.getAllProducts(req.query, undefined, undefined, isAdmin);

    return res.status(200).json({
      status: 'success',
      data: { products, total },
    });
  }

  // get one product
  async getOneProduct(req: ExtendedRequest, res: Response): Promise<Response> {
    const { role: userRole, storeId } = req.user!;
    const { id } = req.params;

    const isAdmin = userRole === UserRolesEnum.ADMIN;

    const include: IncludeOptions[] = [
      {
        association: 'stores',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        ...(!isAdmin && { where: { storeId } }),
        include: [
          {
            association: 'store',
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
          },
        ],
      },
    ];

    const product = await ProductServices.getOneProduct({ id }, include, isAdmin);
    // const product = await Product.findByPk(id)
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: product,
    });
  }

  // Create product
  async createNewProduct(req: Request, res: Response): Promise<Response> {
    const { name, type, variations } = req.body;

    // Restrict standard products to have only one variation
    if (type === ProductTypesEnum.STANDARD && variations.length > 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Standard products should only have one variation which is the default variation',
      });
    }

    // Check if there exist a product with the same name as the one supplied
    const foundProduct = await ProductServices.getOneProduct({ name });
    if (foundProduct) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product with the provided name already exists',
      });
    }

    let url: string | null = null;
    if (req.file) {
      try {
        url = await handleUpload(req.file, 'products');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the product image',
        });
      }
    }

    // create the product
    const product = await ProductServices.createNewProduct({ name, type, image: url });
    if (variations?.length > 0) {
      // Create variations
      await VariationServices.addManyVariations(product.id, variations);
      // Reload the product to get the variations created
      await product.reload();
    }

    return res.status(201).json({
      status: 'success',
      data: product,
    });
  }

  // update product
  async updateProduct(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, variations } = req.body;

    const previousProduct = await ProductServices.getOneProduct({ id });
    if (!previousProduct) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }
    // Restrict standard products to have only one variation
    if (
      previousProduct.type === ProductTypesEnum.STANDARD &&
      (variations?.length > 1 || previousProduct.variations![0].name !== variations[0].name)
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Standard products should only have one default variation',
      });
    }

    // Check if there exist a product with the same name as the one supplied
    const foundProduct = name && (await ProductServices.getOneProduct({ name: name, id: { [Op.not]: id } }));
    if (foundProduct) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product with the provided name already exists',
      });
    }

    let url: string | null = null;
    if (req.file) {
      try {
        url = await handleUpload(req.file, 'products');
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: (error as UploadApiErrorResponse).message || 'Failed while uploading the product image',
        });
      }
    }

    // update the product
    const product = await ProductServices.updateProduct(id, { ...req.body, image: url });
    // delete the old image on cloud
    if (url)
      // No need to bother catching the error as the image is already updated
      handleDeleteUpload(previousProduct.image).catch((error) => {
        console.error('Failed to delete the old image', error);
      });
    // Update the variations
    if (variations?.length > 0) {
      const where: WhereOptions = { name: { [Op.notIn]: variations.map((v: Variation) => v.name) } };
      const includes: IncludeOptions[] = [{ association: 'sales' }];
      const deleteVariations = await VariationServices.getAllVariations(id, where, includes);
      if (deleteVariations.length) {
        for (const variation of deleteVariations) {
          if (variation.sales?.length) {
            return res.status(400).json({
              status: 'fail',
              message: `Variation: ${variation.name} can no longer be deleted because it has already been used in sales.`,
            });
          }
        }
        await VariationServices.deleteVariations({ id: { [Op.in]: deleteVariations.map((v) => v.id) } });
      }

      while (variations.length > 0) {
        const variation = variations[0];
        await VariationServices.updateOrCreateVariation(id, variation);
        variations.shift();
      }
    }

    // Reload the product to get the new variations
    await product.reload();

    return res.status(200).json({
      status: 'success',
      data: product,
    });
  }

  // delete product
  async deleteProduct(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    // const user = req.user!;

    const product = await ProductServices.getProductByPk(id, [
      {
        association: 'stores',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
        include: [
          {
            association: 'store',
            where: { name: { [Op.not]: 'expired' } },
            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
          },
        ],
      },
      {
        association: 'variations',
        include: [{ association: 'sales', required: true }],
      },
    ]);

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found',
      });
    }
    // check if the product has sales or if it is in store products

    if (product.variations?.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product can no longer be deleted because it has already been used in sales.',
      });
    }

    // if the product is in store products, it cannot be deleted
    if (product.stores?.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product cannot be deleted because it is in some stores. Remove it from all stores to continue',
      });
    }

    // record the product in deleted table
    // await recordDeleted({name: user.name, phone: user.phone}, 'product', product);

    await product.destroy();

    // delete the image from cloudinary
    handleDeleteUpload(product.image).catch((error) => {
      console.error('Failed to delete the old image', error);
    });

    return res.status(201).json({
      status: 'success',
      data: 'Product deleted successfully',
      product,
    });
  }

  // get all variations of a product
  async getAllVariations(req: ExtendedRequest, res: Response): Promise<Response> {
    const { productId } = req.params;

    const variations = await VariationServices.getAllVariations(productId);

    return res.status(200).json({
      status: 'success',
      data: variations,
    });
  }

  // delete variation
  async deleteVariation(req: ExtendedRequest, res: Response): Promise<Response> {
    const { id } = req.params;
    const product = req.product!;

    const variations = product['variations']!;
    const variation = variations.find((v) => v.id === id);

    if (!variation) {
      return res.status(404).json({
        status: 'fail',
        message: `variation with id ${id}, not found`,
      });
    }
    if (variations.length <= 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product should have atleast one variation',
      });
    }

    await variation.destroy();

    return res.status(200).json({
      status: 'success',
      data: 'Variation deleted successfully',
    });
  }
}
