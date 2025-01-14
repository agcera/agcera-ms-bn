import Product from '@database/models/product';
import { GetAllRequestQuery } from '@src/types/sales.types';
import { findQueryGenerators } from '@src/utils/generators';
import { IncludeOptions, WhereOptions } from 'sequelize';

export default class ProductServices {
  static DEFAULT_VARIATION_INCLUDE: IncludeOptions = {
    association: 'variations',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'costPrice'] },
  };

  // the include when the user is a keeper with variations
  static VARIATION_INCLUDE_FOR_ADMIN: IncludeOptions = {
    association: 'variations',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
  };

  static DEFAULT_STORES_INCLUDE: IncludeOptions = {
    association: 'stores',
    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
    include: [{ association: 'store', attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] } }],
  };

  static DEFAULT_INCLUDES: IncludeOptions[] = [this.DEFAULT_VARIATION_INCLUDE];

  // get all products
  static async getAllProducts(
    queryData?: GetAllRequestQuery,
    where?: WhereOptions,
    includes?: IncludeOptions[],
    isAdmin?: boolean
  ) {
    const include: IncludeOptions[] = [
      isAdmin ? this.VARIATION_INCLUDE_FOR_ADMIN : this.DEFAULT_VARIATION_INCLUDE,
      ...(includes ?? []),
    ];

    const { count, rows } = await Product.findAndCountAll(
      findQueryGenerators(Product.getAttributes(), queryData, { where, include })
    );

    return { total: count, products: rows };
  }

  // get one product by id
  static async getProductByPk(id: string, includes?: IncludeOptions[]) {
    return await Product.findByPk(id, {
      include: [...this.DEFAULT_INCLUDES, ...(includes || [])],
    });
  }

  // get one product
  static async getOneProduct(where?: WhereOptions, includes?: IncludeOptions[], isAdmin?: boolean) {
    const include: IncludeOptions[] = [
      isAdmin ? this.VARIATION_INCLUDE_FOR_ADMIN : this.DEFAULT_VARIATION_INCLUDE,
      ...(includes ?? []),
    ];

    return await Product.findOne({
      where,
      include,
    });
  }

  // update product
  static async updateProduct(id: string, data: any) {
    const { name, image } = data;
    const product = await Product.findOne({
      where: { id },
      include: [this.DEFAULT_VARIATION_INCLUDE],
    });
    if (!product) throw new Error('Product not found');

    name && (product.name = name);
    image && (product.image = image);

    return await product.save();
  }

  // create new product
  static async createNewProduct(data: any) {
    return await Product.create(data, {
      include: [this.DEFAULT_VARIATION_INCLUDE],
    });
  }
}
