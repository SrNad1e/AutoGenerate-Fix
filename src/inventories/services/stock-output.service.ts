/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, mongo } from 'mongoose';

import {
	CreateStockOutputDto,
	CreateStockOutputParamsDto,
	FiltersStockOutputDto,
	UpdateStockOutputParamsDto,
} from '../dtos/stock-output.dto';
import { InventoriesService } from './inventories.service';
import { Product, ProductTransfer } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/services/products.service';
import { StockOutput } from '../entities/stock-output.entity';

@Injectable()
export class StockOutputService {
	constructor(
		@InjectModel(StockOutput.name) private stockInputModel: Model<StockOutput>,
		private productsService: ProductsService,
		private inventoriesService: InventoriesService,
	) {}

	async getAll(params: FiltersStockOutputDto) {
		const filters: FilterQuery<StockOutput> = {};
		const {
			sort,
			limit = 10,
			skip = 0,
			warehouseId,
			number,
			status,
			createdAtMin,
			createdAtMax,
			productId,
		} = params;

		if (productId) {
			filters['detail.product.id'] = new mongo.ObjectId(productId);
		}

		if (warehouseId) {
			filters['warehouse.id'] = parseInt(warehouseId.toString());
		}
		if (number) {
			filters['number'] = parseInt(number.toString());
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

		const aggregate = [];

		if (filters) {
			aggregate.push({ $match: filters });
		}

		//campos necesarios para traer
		aggregate.push({
			$group: {
				_id: '$_id',
				number: { $first: '$number' },
				detail: { $first: '$detail' },
				total: { $first: '$total' },
				quantity: { $first: '$quantity' },
				warehouse: { $first: '$warehouse' },
				observation: { $first: '$observation' },
				status: { $first: '$status' },
				createdAt: { $first: '$createdAt' },
				updatedAt: { $first: '$updatedAt' },
			},
		});

		if (sort) {
			aggregate.push({ $sort: sort });
		}

		try {
			const result = await this.stockInputModel
				.aggregate([
					...aggregate,
					{
						$group: {
							_id: null,
							total: { $sum: 1 },
							data: { $push: '$$ROOT' },
						},
					},
					{
						$project: {
							total: 1,
							data: {
								$slice: [
									'$data',
									parseInt(skip.toString()),
									parseInt(limit.toString()),
								],
							},
						},
					},
				])
				.exec();

			if (result[0]) {
				return {
					data: result[0].data,
					total: result[0].total,
					limit: parseInt(limit.toString()),
					skip: parseInt(skip.toString()),
				};
			} else {
				return {
					data: [],
					total: 0,
					limit: parseInt(limit.toString()),
					skip: parseInt(skip.toString()),
				};
			}
		} catch (e) {
			console.log(e);
			return new NotFoundException(e);
		}
	}

	async getById(id: string) {
		try {
			return this.stockInputModel.findById(id);
		} catch (e) {
			return new NotFoundException(e);
		}
	}

	async create(params: CreateStockOutputParamsDto) {
		const { products, warehouse, observation, status = 'open', user } = params;

		const productsError = products.find((product) => product.quantity <= 0);

		if (productsError) {
			return new NotFoundException(
				`La salida no puede ser creada, la cantidad del producto ${productsError.product_id} no puede ser 0`,
			);
		}

		//consultar productos
		const detail = await this.getDetail(products);
		const quantity = detail.reduce((sum, item) => sum + item.quantity, 0);
		const total = detail.reduce(
			(sum, item) => sum + item.quantity * item.product.cost,
			0,
		);
		//se debe cargar todo el inventario
		let addProducts;
		if (status === 'save') {
			for (let i = 0; i < detail.length; i++) {
				const item = detail[i];

				addProducts = await this.inventoriesService.deleteProductInventory(
					{
						...item.product,
						quantity: item.quantity,
					} as ProductTransfer,
					warehouse.id,
				);

				if (addProducts !== true) {
					for (let j = 0; j < j; j++) {
						const itemAdd = detail[j];

						addProducts = await this.inventoriesService.addProductInventory(
							{
								...itemAdd.product,
								quantity: itemAdd.quantity,
							} as ProductTransfer,
							warehouse.id,
						);
					}
					break;
				}
			}
		} else {
			addProducts = true;
		}

		if (addProducts === true) {
			//crear la entrada
			const newInput = await this.createStockInput({
				detail,
				status,
				quantity,
				total,
				observation,
				warehouse,
				user,
			});

			if (typeof newInput === 'object') {
				return newInput;
			} else {
				return new NotFoundException(`Error al crear la salida ${newInput}`);
			}
		} else {
			return new NotFoundException(
				`Error al eliminar productos al inventario ${addProducts}`,
			);
		}
	}

	async update(id: string, params: UpdateStockOutputParamsDto) {
		const { products, status, user, observation, warehouse, ...props } = params;
		try {
			//obtenemos los datos para validarlos con los ya guardados
			const stockInput = await this.stockInputModel.findById(id);

			const productsError = products.find((product) => product.quantity <= 0);
			if (
				status === 'open' &&
				(stockInput.status !== 'open' || productsError)
			) {
				return new NotFoundException(
					`La salida ${stockInput.number} no puede ser creado`,
				);
			}

			if (
				status === 'canceled' &&
				(stockInput.status === 'pending' ||
					user.shop_id !== stockInput.warehouse.shopId)
			) {
				return new NotFoundException(
					`La salida ${stockInput.number} no puede ser cancelada`,
				);
			}
			if (status === 'open' || status === 'save') {
				const detail = await this.getDetail(products);

				const detailNew = detail.map((item) => {
					const detailOld = stockInput.detail.find(
						(itemOld) => item.product._id === itemOld.product._id,
					);
					if (detailOld) {
						return {
							...detailOld,
							quantity: item.quantity,
							updateAt: new Date(),
						};
					} else {
						return {
							product: item.product,
							quantity: item.quantity,
							createdAt: new Date(),
							updateAt: new Date(),
						};
					}
				});

				let addProducts;
				if (status === 'save') {
					for (let i = 0; i < detailNew.length; i++) {
						const item = detailNew[i];

						addProducts = await this.inventoriesService.deleteProductInventory(
							{
								...item.product,
								quantity: item.quantity,
							} as ProductTransfer,
							warehouse.id,
						);
						if (addProducts !== true) {
							for (let j = 0; j < j; j++) {
								const itemAdd = detailNew[j];

								addProducts = await this.inventoriesService.addProductInventory(
									{
										...itemAdd.product,
										quantity: itemAdd.quantity,
									} as ProductTransfer,
									warehouse.id,
								);
							}
							break;
						}
					}
				} else {
					addProducts = true;
				}
				if (addProducts === true) {
					return this.stockInputModel.findByIdAndUpdate(
						id,
						{
							$set: {
								...props,
								observation,
								status,
								detail: detailNew,
								user,
							},
						},
						{ new: true },
					);
				} else {
					return new NotFoundException(
						`Error al eliminar los productos al inventario ${addProducts}`,
					);
				}
			}

			if (status === 'canceled') {
				return this.stockInputModel.findByIdAndUpdate(
					id,
					{ status, observation },

					{ new: true },
				);
			}
		} catch (e) {
			console.log(e);
			return new NotFoundException(e);
		}
	}

	/**
	 * @description se encarga de consultar los productos y crear el detail
	 * @param products productos a agregar en el detail
	 * @param status estado de los productos
	 * @returns detail para la salida
	 */
	async getDetail(
		products: {
			product_id: number;
			quantity: number;
		}[],
	) {
		const productsIds = products.map((product) => product.product_id);
		const productsResponse: Product[] =
			await this.productsService.getProductsIdSql(productsIds);

		return productsResponse.map((product) => {
			const prod = products.find((item) => product.id === item.product_id);
			if (prod) {
				return {
					product,
					quantity: prod.quantity,
					createdAt: new Date(),
					updateAt: new Date(),
				};
			}
			return {
				product,
				quantity: 0,
				createdAt: new Date(),
				updateAt: new Date(),
			};
		});
	}

	/**
	 * @description crea el salida de mercancía
	 * @param params datos para la creación de la salida
	 */
	async createStockInput(params: CreateStockOutputDto) {
		try {
			const response = await this.stockInputModel.create(params);
			return response;
		} catch (e) {
			return e;
		}
	}
}
