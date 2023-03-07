import { Injectable } from '@nestjs/common';
import { FiltersStockInput } from '../dtos/filters-stockService-input';
import {
	Types,
	AggregatePaginateModel
} from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ReferencesService } from 'src/products/services/references.service';

const project: any = {
	stock: 1,
	barcode: 1,
	size: {
		$arrayElemAt: ['$size', 0],
	},
	reference: {
		$arrayElemAt: ['$reference', 0],
	},
	color: {
		$arrayElemAt: ['$color', 0],
	},
	productWarehouse: 1
};

@Injectable()
export class StockService {
	constructor(
		@InjectModel(Product.name)
		private readonly productModel: AggregatePaginateModel<Product>,
		private readonly referencesService: ReferencesService,
	) { }

	async productsStock(
		{ colorId, limit = 10, name, page = 1, sizeId, status = 'active', warehouseId }: FiltersStockInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: any = {}
		const filteredWarehouse: any = {};
		if (colorId) {
			filters.color = new Types.ObjectId(colorId);
		}
		if (sizeId) {
			filters.size = new Types.ObjectId(sizeId);
		}
		if (status) {
			filters['status'] = status;
		}
		if (name) {
			const references = await this.referencesService.findAll(
				{
					name,
				},
				false,
				companyId,
			);

			if (references?.totalDocs > 0) {
				filters.reference = {
					$in: references.docs.map((item) => item._id),
				};
			} else {
				filters.barcode = name;
			}
		}

		if (warehouseId) {
			filteredWarehouse['stock.warehouse'] = new Types.ObjectId(warehouseId)
		}

		const options = {
			limit,
			page,
			lean: true
		};
		const aggregateProduct: any = this.productModel.aggregate([
			{
				$match: filters,
			},
			{
				$lookup: {
					from: 'sizes',
					localField: 'size',
					foreignField: '_id',
					as: 'size',
				},
			},
			{
				$lookup: {
					from: 'colors',
					localField: 'color',
					foreignField: '_id',
					as: 'color',
				},
			},
			{
				$lookup: {
					from: 'references',
					localField: 'reference',
					foreignField: '_id',
					as: 'reference',
				},
			},
			{
				$lookup: {
					from: 'warehouses',
					localField: 'stock.warehouse',
					foreignField: '_id',
					as: "productWarehouse",
				}
			},
			{
				$unwind: '$stock'
			},
			{
				$project: project,
			},
			{
				$match: filteredWarehouse
			}
		]);
		return this.productModel.aggregatePaginate(aggregateProduct, options);
	}
}