import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventories } from 'src/inventories/entities/inventories.entity';
import { Product } from 'src/products/entities/product.entity';
import { Promise } from 'mongoose';

@Injectable()
export class InventoriesService {
	constructor(
		@InjectRepository(Inventories)
		private inventoriesRepo: Repository<Inventories>,
	) {}

	/**
	 * @description agrega unidades al inventario de un producto en específico
	 * @param product producto a agregar uniades
	 * @param warehouseId bodega para agregar unidades
	 */
	async addProductInventory(product: Product, warehouseId: number) {
		try {
			const inventories = await this.inventoriesRepo.findOne({
				warehouse_id: warehouseId,
				product_id: product.product_id,
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
	 */
	async deleteProductInventory(product: Product, warehouseId: number) {
		try {
			const inventories = await this.inventoriesRepo.findOne({
				warehouse_id: warehouseId,
				product_id: product.product_id,
			});
			this.inventoriesRepo.merge(inventories, {
				stock: inventories.stock - parseInt(product.quantity.toString()),
			});
			await this.inventoriesRepo.save(inventories);
			return true;
		} catch (e: any) {
			console.log(e);
			return `Error al eliminar productos al inventario ${e}`;
		}
	}
}
