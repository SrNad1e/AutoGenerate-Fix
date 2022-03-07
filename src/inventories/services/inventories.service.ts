import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class InventoriesService {
	async addProductInventory(product: Product, warehouseId: Types.ObjectId) {}
	async deleteProductInventory(product: Product, warehouseId: Types.ObjectId) {}
}
