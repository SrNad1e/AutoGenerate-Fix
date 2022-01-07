import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/products/entities/product.entity';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrdersService {
	constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

	findById(id: string) {
		return this.orderModel.findById(id);
	}

	/**
	 * @description se encarga de agregar a la orden los productos devueltos
	 * @param products productos a devolver
	 * @param orderId orden para editar
	 * @returns un string si hay un error de lo contrario un true
	 */
	async selectProductReturn(products: Product[], orderId: string) {
		try {
			//Validar existencia de orden
			const order = await this.findById(orderId);
			let errorProduct;
			const productsUpdate = [];
			if (order) {
				products.forEach((product) => {
					//valida si el producto puede ser cambiado
					const productChangeble = order.products.find(
						(item) =>
							item._id.toString() === product._id.toString() && item.changeable,
					);

					if (!productChangeble) {
						errorProduct = `El producto ${product.reference}/${product.color.name}/${product.size.value} no está habilitado para cambio`;
						return;
					}

					//valida si el producto tiene unidades para cambiar
					const productFind = order.products.find(
						(item) =>
							item._id.toString() === product._id.toString() &&
							item.quantity >=
								(item.returns.reduce(
									(sum, dato) => sum + dato.quantityReturn,
									0,
								) || 0) +
									product.quantity,
					);

					if (!productFind) {
						errorProduct = `El producto ${product.reference}/${product.color.name}/${product.size.value} no tiene unidades disponibles para devolver`;
						return;
					}

					productsUpdate.push({
						...productFind,
						returns: [
							...productFind.returns,
							{
								createdAt: new Date(),
								returnType: product.returnType,
								quantityReturn: product.quantity,
							},
						],
					});
				});
				if (errorProduct) {
					return errorProduct;
				}

				//Actualizar orden con los productos
				const productsOrder = order.products.filter((product) => {
					let ok = true;
					products.forEach((item) => {
						if (item._id.toString() === product._id.toString()) {
							ok = false;
							return;
						}
					});
					return ok;
				});

				await this.orderModel.findByIdAndUpdate(orderId, {
					$set: { products: productsOrder.concat(productsUpdate) },
				});

				return true;
			}
			return 'No existe la orden seleccionada';
		} catch (e: any) {
			return e;
		}
	}
}
