import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { ProductsService } from 'src/products/services/products.service';
import { WarehousesService } from 'src/shops/services/warehouses.service';
import { AddStockHistoryInput } from '../dtos/add-stockHistory-input';
import { DeleteStockHistoryInput } from '../dtos/delete-stockHistory-input';
import { StockHistory } from '../entities/stock-history.entity';
import { StockInput } from '../entities/stock-input.entity';
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
		private readonly warehousesService: WarehousesService,
		private readonly productsService: ProductsService,
	) {}

	async addStock({
		details,
		documentId,
		documentType,
		warehouseId,
	}: AddStockHistoryInput) {
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
				case 'adjustment':
					//	document = await this.stockTransferService.findById(documentId);
					break;
				case 'refund':
					//	document = await this.stockTransferService.findById(documentId);
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

			const { totalDocs } = await this.productsService.findAll({
				ids: products,
				status: 'active',
				limit: -1,
			});
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

	async deleteStock({
		details,
		documentId,
		documentType,
		warehouseId,
	}: DeleteStockHistoryInput) {
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
					//	document = await this.stockTransferService.findById(documentId);
					break;
				case 'adjustment':
					//	document = await this.stockTransferService.findById(documentId);
					break;
				case 'invoice':
					//	document = await this.stockTransferService.findById(documentId);
					break;
				case 'order':
					//	document = await this.stockTransferService.findById(documentId);
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

			const { totalDocs } = await this.productsService.findAll({
				ids: products,
				status: 'active',
				limit: -1,
			});
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
			return error;
		}
	}
}
