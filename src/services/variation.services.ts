import Variation from '@database/models/variation';
import ProductServices from './product.services';
import { IncludeOptions, WhereOptions } from 'sequelize';

export default class VariationServices {
  static async deleteVariations(where: WhereOptions) {
    // Add variations
    return Variation.destroy({ where });
  }

  static async addManyVariations(productId: string, variations: any[]) {
    // Add variations
    return Variation.bulkCreate(variations.map((variation: any) => ({ ...variation, productId })));
  }

  static async updateOrCreateVariation(productId: string, data: any): Promise<Variation | undefined> {
    // update or create variation
    const product = await ProductServices.getProductByPk(productId);
    if (!product) return;

    const { name, costPrice, sellingPrice, number } = data;

    const variations: Variation[] = product['variations'] ?? [];
    let variation: Variation | undefined = variations.find((v) => v.name === name);

    if (variation) {
      costPrice && (variation.costPrice = costPrice);
      sellingPrice && (variation.sellingPrice = sellingPrice);
      number && (variation.number = number);
      await variation.save();
    } else {
      variation = await Variation.create({ ...data, productId });
    }

    return variation;
  }

  // Get all variations of a product
  static async getAllVariations(
    productId: string,
    where?: WhereOptions,
    includes?: IncludeOptions[]
  ): Promise<Variation[]> {
    return Variation.findAll({ where: { productId, ...where }, include: includes });
  }
}
