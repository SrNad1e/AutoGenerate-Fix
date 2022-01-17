import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name) private productModel: Model<Product>,
	) {}

	/**
	 * @description obtiene el producto con base al id de mysql
	 * @param id identificador del producto en mysql
	 */
	async getProductsIdSql(ids: number[]) {
		return await this.productModel.find({ id: { $in: ids } });
	}
}
