/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';

import { CouponsService } from 'src/coupons/services/coupons.service';
import { CreateRefundsDto, FiltersRefundsDto } from '../dtos/refunds.dto';
import { ProductReturns } from '../entities/productreturns.entity';
import { Refund } from '../entities/refund.entity';
import { OrdersService } from './orders.service';

//TODO: pendiente cambiar entidad
@Injectable()
export class RefundsService {
	constructor(
		@InjectModel(ProductReturns.name)
		private productReturnsModel: Model<ProductReturns>,
		private couponsService: CouponsService,
		private orderService: OrdersService,
	) {}

	async getAll(params: FiltersRefundsDto) {
		const filters: FilterQuery<Refund> = {};
		const {
			limit = 20,
			skip = 0,
			orderCode,
			invoiceNumber,
			shopId,
			sort,
		} = params;

		//TODO: pasar parametro a numero ya que el código es númerico
		if (orderCode) {
			filters['order.code'] = orderCode.toString();
		}

		//TODO: pasar parametro a numero ya que el número es númerico
		if (invoiceNumber) {
			filters['invoice.number'] = invoiceNumber.toString();
		}

		if (shopId) {
			filters['shop.shopId'] = parseInt(shopId.toString());
		}
		const result = await this.productReturnsModel
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

	async create(params: CreateRefundsDto) {
		const { products, orderId } = params;

		const amount = products.reduce(
			(sum, product) => sum + product.quantity * product.salePriceUnit,
			0,
		);

		const orderFind = await this.orderService.findById(orderId);
		if (!orderFind) {
			return new NotFoundException(`Pedido no encontrado`);
		} else {
			//Validamos y editamos pedido
			const editOrder = await this.orderService.selectProductReturn(
				products,
				orderId,
			);

			if (editOrder === true) {
				let refund;
				try {
					//Agregamos las unidades al inventario

					let addInventory;
					for (let i = 0; i < products.length; i++) {
						const product = products[i];
						addInventory = true /*await this.inventoriesService.addProductInventory(
							product,
							orderFind['_doc'].warehouse.warehouseId,
						);*/
						if (addInventory !== true) {
							for (let j = 0; j < i; j++) {
								const productDelete = products[j];
								/*await this.inventoriesService.deleteProductInventory(
									productDelete,
									orderFind['_doc'].warehouse.warehouseId,
								);*/
							}

							break;
						}
					}
					if (addInventory === true) {
						//Creamos devolución
						refund = await this.createRefund({
							...params,
							amount,
							invoice: orderFind.invoice,
							order: orderFind,
							shop: orderFind.shop,
						});
						//creamos cupón
						const resultCoupon = await this.couponsService.create({
							...params,
							amount,
							order: orderFind,
							refund: refund['_doc'],
							invoice: orderFind.invoice,
							shop: orderFind.shop,
							customer: orderFind['_doc'].customer,
						});

						return {
							...refund['_doc'],
							coupon: resultCoupon['_doc'],
						};
					} else {
						return new NotFoundException(
							`Error al crear agregar inventario, ${addInventory} `,
						);
					}
				} catch (e) {
					return new NotFoundException(`Error al crear la devolución, ${e} `);
				}
			} else {
				return new NotFoundException(
					`Error al crear la devolución: ${editOrder}`,
				);
			}
		}
	}

	/**
	 * crea devolucion
	 * @param params datos para crear la devolucion
	 * @returns si es verdadero devolucion de lo contrario un error
	 */
	createRefund(params: any) {
		const newRefund = new this.productReturnsModel(params);
		return newRefund.save();
	}
}
