import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { InventoriesService } from 'src/inventories/services/inventories/inventories.service';
import { Product, ProductTransfer } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/services/products.service';
import { WarehouseService } from 'src/shops/services/warehouses.service';
import {
	CreateStockTransferDto,
	CreateStockTransferParamsDto,
	FiltersStockTransferDto,
} from '../dtos/stock-transfer.dto';
import { StockTransfer } from '../entities/stock-transfer.entity';

@Injectable()
export class StockTransferService {
	constructor(
		@InjectModel(StockTransfer.name)
		private stockTransferModel: Model<StockTransfer>,
		private productsService: ProductsService,
		private warehousesService: WarehouseService,
		private inventoryService: InventoriesService,
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

	async create(params: CreateStockTransferParamsDto) {
		const {
			products,
			warehouseDestinationId,
			warehouseOriginId,
			observationDestination,
			observationOrigin,
			status = 'open',
			user,
		} = params;

		//consultar productos
		const productsIds = products.map((product) => product.product_id);

		const productsResponse: Product[] =
			await this.productsService.getProductsIdSql(productsIds);

		const detail = productsResponse.map((product) => {
			const prod = products.find((item) => product.id === item.product_id);
			if (prod) {
				return {
					product,
					quantity: prod.quantity,
					status: 'open',
					createdAt: new Date(),
					updateAt: new Date(),
				};
			}
			return {
				product,
				quantity: 0,
				status: 'open',
				createdAt: new Date(),
				updateAt: new Date(),
			};
		});

		//consultar bodegas

		const warehouseOrigin = await this.warehousesService.getByIdMysql(
			warehouseOriginId,
		);

		const warehouseDestination = await this.warehousesService.getByIdMysql(
			warehouseDestinationId,
		);

		let updateInventories;
		//modificación en inventario
		for (let i = 0; i < detail.length; i++) {
			const item = detail[i];
			const product = item?.product['_doc'];
			let result = await this.inventoryService.deleteProductInventory(
				{
					...product,
					quantity: item.quantity,
				},
				warehouseOriginId,
			);
			if (status === 'sent') {
				result = await this.inventoryService.addProductStockInProcess({
					documentType: 'transfer',
					productId: item.product['_doc']._id,
					cost: product.cost,
					quantity: item.quantity,
					warehouseId: warehouseDestination._id,
				});
			}
			updateInventories = result;
		}

		if (updateInventories === true) {
			//crear la transferencia
			const transferOk = await this.createStockTransfer({
				warehouseOrigin,
				warehouseDestination,
				userIdOrigin: user.id,
				detail,
				status,
				observationDestination,
				observationOrigin,
			});

			if (typeof transferOk === 'object') {
				return transferOk;
			} else {
				//TODO: eliminar traslado generado
				return new NotFoundException(
					`Error al crear la transferencia ${transferOk}`,
				);
			}
		} else {
			return new NotFoundException(updateInventories);
		}
	}

	/**
	 * @description crea el traslado de mercancía
	 * @param params datos para la creación del traslado
	 */
	async createStockTransfer(params: CreateStockTransferDto) {
		try {
			const response = await this.stockTransferModel.create(params);
			return response;
		} catch (e) {
			return e;
		}
	}
}
