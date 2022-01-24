/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';

import { Inventories } from 'src/inventories/entities/inventories.entity';
import { ProductTransfer } from 'src/products/entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { StockInProcess } from 'src/inventories/entities/stockInProcess.entity';
import { Model, ObjectId } from 'mongoose';
import {
	createStockInProcess,
	deleteStockInProcess,
	FiltersStockInProcess,
	updateStockInProcess,
} from 'src/inventories/dtos/stockInProcess.dto';
import { Warehouse } from 'src/shops/entities/warehouse.entity';

@Injectable()
export class InventoriesService {
	constructor(
		@InjectRepository(Inventories)
		private inventoriesRepo: Repository<Inventories>,
		@InjectModel(StockInProcess.name)
		private stockInProcessModel: Model<StockInProcess>,
	) {}

	/**
	 * @description agrega unidades al inventario de un producto en específico
	 * @param product producto a agregar uniades
	 * @param warehouseId bodega para agregar unidades
	 * @returns string si existe algun error o true si el proceso finaliza correctamente
	 */
	async addProductInventory(product: ProductTransfer, warehouseId: number) {
		try {
			const inventories = await this.inventoriesRepo.findOne({
				warehouse_id: warehouseId,
				product_id: product.product_id || product.id,
			});

			this.inventoriesRepo.merge(inventories, {
				stock: inventories.stock + parseInt(product.quantity.toString()),
			});
			await this.inventoriesRepo.save(inventories);
			return true;
		} catch (e) {
			console.log(e);

			return `Error al agregar productos al inventario ${e}`;
		}
	}

	/**
	 * @description elimina unidades al inventario de un producto en específico
	 * @param product producto a eliminar uniades
	 * @param warehouseId bodega para eliminar unidades
	 * @returns string si existe algun error o true si el proceso finaliza correctamente
	 */
	async deleteProductInventory(product: ProductTransfer, warehouseId: number) {
		const product_id = product.product_id || product.id;

		try {
			const inventory = await this.inventoriesRepo.findOne({
				warehouse_id: warehouseId,
				product_id,
			});

			//valida si hay inventario disponible
			if (inventory?.available >= parseInt(product.quantity.toString())) {
				this.inventoriesRepo.merge(inventory, {
					stock: inventory.stock - parseInt(product.quantity.toString()),
				});
				await this.inventoriesRepo.save(inventory);

				return true;
			} else {
				return {
					message: `Error al eliminar productos del inventario, el producto ${product.reference} / ${product.color.name} / ${product.size.value} no tiene unidades suficientes, disponibles ${inventory.available}`,
					product,
				};
			}
		} catch (e: any) {
			return { message: `Error al eliminar productos del inventario ${e}` };
		}
	}

	/**
	 * @description agrega productos al stock en proceso
	 * @param props datos para crear el stock en proceso
	 * @returns string si existe algun error o true si el proceso finaliza correctamente
	 */
	async addProductStockInProcess(props: createStockInProcess) {
		try {
			const newStockInProcess = new this.stockInProcessModel(props);
			newStockInProcess.save();
			return true;
		} catch (e) {
			return `Error al agregar inventario en proceso ${e}`;
		}
	}

	/**
	 * @description elimina productos al stock en proceso
	 * @param props datos para eliminar el stock en proceso
	 * @returns string si existe algun error o true si el proceso finaliza correctamente
	 */
	async deleteProductStockInProcess(props: deleteStockInProcess) {
		try {
			await this.stockInProcessModel.findOneAndDelete(props);
			return true;
		} catch (e) {
			return `Error al eliminar inventario en proceso ${e}`;
		}
	}

	/**
	 * @description se encarga de actualizar un stock en proceso
	 * @param params objeto de parametros usados para actualizar el documento
	 * @returns string si se genera algun error o true si el proceso finaliza correctamente
	 */
	async updateProductStockInProcess(params: updateStockInProcess) {
		const { productId, warehouseId, ...changes } = params;
		try {
			const stockInProcess = this.stockInProcessModel
				.findOneAndUpdate({ productId, warehouseId }, { $set: changes })
				.exec();
			if (!stockInProcess) {
				return `Error al actualizar inventario en proceso, producto no existe`;
			}
			return true;
		} catch (e) {
			return `Error al agregar inventario en proceso ${e}`;
		}
	}

	/**
	 * @description se encarga de actualizar varios stock en proceso
	 * @param params objeto de parametros usados para actualizar el documento
	 * @returns string si se genera algun error o true si el proceso finaliza correctamente
	 */
	async updateProductsStockInProcess(documentId: ObjectID, status: string) {
		try {
			const stockInProcess = this.stockInProcessModel
				.updateMany({ documentId }, { $set: { status } })
				.exec();
			if (!stockInProcess) {
				return `Error al actualizar inventario en proceso, producto no existe`;
			}
			return true;
		} catch (e) {
			return `Error al agregar inventario en proceso ${e}`;
		}
	}

	/**
	 * @description consulta el inventario de un producto en una bodega en especifico
	 * @param product producto a consultar
	 * @param warehouseId bodega a consultar inventario
	 * @returns objeto type inventory
	 */
	async getOne(product: ProductTransfer, warehouseId: number) {
		return this.inventoriesRepo.findOne({
			product_id: product.id,
			warehouse_id: warehouseId,
		});
	}

	async getReserveStock(params: FiltersStockInProcess) {
		return this.stockInProcessModel.find(params);
	}

	/**
	 * @description se encarga de reservar el inventario
	 * @param product producto a reservar
	 * @param warehouseOrigin bodega de salida
	 * @param warehouseDestination bodega de la reserva
	 * @param documentType tipo de documento que genera la reserva
	 * @param documentId id del documento que genera la reserva
	 * @returns Error si algo pasa o true si solo sale bien
	 */
	async reserveStock(
		product: ProductTransfer,
		warehouseOrigin: Warehouse,
		warehouseDestination: Warehouse,
		documentType: string,
		documentId: ObjectId,
	) {
		let result;
		result = await this.deleteProductInventory(product, warehouseOrigin.id);
		if (result === true) {
			result = await this.addProductStockInProcess({
				documentType,
				productId: product._id,
				cost: product.cost,
				quantity: product.quantity,
				warehouseId: warehouseDestination._id,
				documentId,
			});
		}
		return result;
	}

	/**
	 * @description se encarga de reversar el cambio de inventario
	 * @param product producto a reservar
	 * @param warehouseOrigin bodega de salida
	 * @param warehouseDestination bodega de la reserva
	 * @param documentType tipo de documento que genera la reserva
	 * @param documentId id del documento que genera la reserva
	 * @returns Error si algo pasa o true si solo sale bien
	 */
	async reverseStock(
		product: ProductTransfer,
		warehouseOrigin: Warehouse,
		warehouseDestination: Warehouse,
		documentId: ObjectId,
	) {
		let result;

		result = await this.addProductInventory(product, warehouseOrigin.id);
		if (result === true) {
			result = await this.deleteProductStockInProcess({
				productId: product._id,
				cost: product.cost,
				quantity: product.quantity,
				warehouseId: warehouseDestination._id,
				documentId,
			});
		}
		return result;
	}
}
