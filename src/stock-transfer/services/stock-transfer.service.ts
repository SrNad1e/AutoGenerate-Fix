import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { FiltersStockTransferDto } from '../dtos/stock-transfer.dto';
import { StockTransfer } from '../entities/stock-transfer.entity';

@Injectable()
export class StockTransferService {
	constructor(
		@InjectModel(StockTransfer.name)
		private stockTransferModel: Model<StockTransfer>,
	) {}

	async getAll(params: FiltersStockTransferDto) {
		const filters: FilterQuery<StockTransfer> = {};
		const {
			sort,
			limit = 20,
			skip = 0,
			warehouseDestinationId,
			warehouseOriginId,
			number,
			shopId,
			status,
			createdAtMin,
			createdAtMax,
		} = params;
		if (warehouseDestinationId) {
			filters['warehouseDestination.id'] = parseInt(
				warehouseDestinationId.toString(),
			);
		}
		if (warehouseOriginId) {
			filters['warehouseOrigin.id'] = parseInt(warehouseOriginId.toString());
		}
		if (number) {
			filters['number'] = parseInt(number.toString());
		}
		if (shopId) {
			filters['shop.id'] = parseInt(shopId.toString());
		}
		if (status) {
			filters['status'] = status;
		}
		if (createdAtMin && createdAtMax) {
			filters.createdAt = {
				$gte: new Date(createdAtMin),
				$lt: new Date(createdAtMax),
			};
		}

		const result = await this.stockTransferModel
			.find(filters)
			.sort(sort)
			.limit(limit)
			.skip(skip)
			.exec();

		return {
			data: result,
			total: result?.length,
			limit,
			skip,
		};
	}
}
