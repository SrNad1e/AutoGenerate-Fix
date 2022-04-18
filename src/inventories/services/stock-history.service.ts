import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { Order } from 'src/sales/entities/order.entity';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { User } from 'src/users/entities/user.entity';
import { CreateStockHistoryInput } from '../dtos/create-stockHistory-input';
import { StockAdjustment } from '../entities/stock-adjustment.entity';
import { StockHistory } from '../entities/stock-history.entity';
import { StockInput } from '../entities/stock-input.entity';
import { StockOutput } from '../entities/stock-output.entity';
import { StockTransfer } from '../entities/stock-transfer.entity';

@Injectable()
export class StockHistoryService {
	constructor(
		@InjectModel(StockHistory.name)
		private readonly stockHistoryModel: PaginateModel<StockHistory>,
		@InjectModel(StockTransfer.name)
		private readonly stockTransferModel: PaginateModel<StockTransfer>,
		@InjectModel(StockInput.name)
		private readonly stockInputModel: PaginateModel<StockInput>,
		@InjectModel(StockOutput.name)
		private readonly stockOutputModel: PaginateModel<StockOutput>,
		@InjectModel(StockAdjustment.name)
		private readonly stockAdjustmentModel: PaginateModel<StockAdjustment>,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
		private readonly warehousesService: WarehousesService,
		private readonly productsService: ProductsService,
	) {}

	async addStock(
		{ details, documentId, documentType, warehouseId }: CreateStockHistoryInput,
		user: Partial<User>,
	) {
		let item;
		try {
			const validateQuantity = details.find((item) => !(item.quantity > 0));
			if (validateQuantity) {
				throw new BadRequestException(
					`No se puede agregar productos con cantidades en 0`,
				);
			}
			let document;
			switch (documentType) {
				case 'transfer':
					document = await this.stockTransferModel.findById(documentId).lean();
					break;
				case 'input':
					document = await this.stockInputModel.findById(documentId).lean();
					break;
				case 'order':
					document = await this.orderModel.findById(documentId).lean();
					break;
				case 'adjustment':
					document = await this.stockAdjustmentModel.findById(documentId);
					break;
				default:
					throw new BadRequestException(
						`El tipo de documento ${documentType} es invalido`,
					);
			}

			if (!document) {
				throw new BadRequestException(`La documento no existe`);
			}

			const warehouse = this.warehousesService.findById(warehouseId);
			if (!warehouse) {
				throw new BadRequestException(`La bodega no existe`);
			}

			const products = details.map((detail) => detail.productId.toString());

			const { totalDocs } = await this.productsService.findAll(
				{
					ids: products,
					status: 'active',
					limit: -1,
				},
				user,
			);
			if (totalDocs !== products.length) {
				throw new BadRequestException(
					`Un producto no existe o se encuentra inactivo, revise la lista de productos`,
				);
			}
			//agregar al inventario
			for (let i = 0; i < details.length; i++) {
				const { productId, quantity } = details[i];
				const product = await this.productsService.addStock(
					productId,
					quantity,
					warehouseId,
				);

				if (product) {
					const newHistory = new this.stockHistoryModel({
						warehouse: warehouseId,
						currentStock: product?.stock[0]?.quantity,
						quantity,
						product: productId,
						documentType,
						documentNumber: document.number,
					});
					await newHistory.save();
					item = i;
				}
			}
		} catch (error) {
			if (item) {
				//TODO: pendiente planear el reversar
			}
			return error;
		}
	}

	async deleteStock(
		{ details, documentId, documentType, warehouseId }: CreateStockHistoryInput,
		user: Partial<User>,
	) {
		let item;

		try {
			const validateQuantity = details.find((item) => !(item.quantity > 0));
			if (validateQuantity) {
				throw new BadRequestException(
					`No se puede eliminar productos con cantidades en 0`,
				);
			}
			let document;
			switch (documentType) {
				case 'transfer':
					document = await this.stockTransferModel.findById(documentId).lean();
					break;
				case 'output':
					document = await this.stockOutputModel.findById(documentId).lean();
					break;
				case 'adjustment':
					document = await this.stockAdjustmentModel.findById(documentId);
					break;
				case 'order':
					document = await this.orderModel.findById(documentId).lean();
					break;
				default:
					throw new BadRequestException(
						`El tipo de documento ${documentType} es invalido`,
					);
			}
			if (!document) {
				throw new BadRequestException(`La documento no existe`);
			}

			const warehouse = this.warehousesService.findById(warehouseId);
			if (!warehouse) {
				throw new BadRequestException(`La bodega no existe`);
			}

			const products = details.map((detail) => detail.productId.toString());

			const { totalDocs } = await this.productsService.findAll(
				{
					ids: products,
					status: 'active',
					limit: -1,
				},
				user,
			);

			if (totalDocs !== products.length) {
				throw new BadRequestException(
					`Un producto no existe o se encuentra inactivo, revise la lista de productos`,
				);
			}

			for (let i = 0; i < details.length; i++) {
				const { productId, quantity } = details[i];
				const product = await this.productsService.deleteStock(
					productId,
					quantity,
					warehouseId,
				);

				if (product) {
					const newHistory = new this.stockHistoryModel({
						warehouse: warehouseId,
						currentStock: product?.stock[0]?.quantity,
						quantity: -quantity,
						product: productId,
						documentType,
						documentNumber: document.number,
					});
					await newHistory.save();

					item = i;
				}
			}
		} catch (error) {
			if (item) {
				//TODO: pendiente planear el reversar
			}
			throw error;
		}
	}
}
