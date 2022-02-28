/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { Repository } from 'typeorm';

import {
	CreateStockRequestDto,
	CreateStockRequestParamsDto,
	FiltersStockRequestDto,
	UpdateStockRequestDto,
	UpdateStockRequestParamsDto,
} from '../dtos/stock-request.dto';
import { InventoriesService } from 'src/inventories/services/inventories.service';
import { Product } from 'src/products/entities/product.entity';
import { ProductsService } from 'src/products/services/products.service';
import { StockRequest } from '../entities/stock-request.entity';
import { StockTransferDetailMysql } from '../entities/stock-transfer-detail.migrate.entity';
import { StockTransferMysql } from '../entities/stock-transfer.migrate.entity';
import { UsersService } from 'src/users/services/users.service';
import { WarehouseService } from 'src/shops/services/warehouses.service';

@Injectable()
export class StockRequestService {
	constructor(
		@InjectModel(StockRequest.name)
		private stockRequestModel: Model<StockRequest>,
		@InjectRepository(StockTransferMysql)
		private stockTransferRepo: Repository<StockTransferMysql>,
		@InjectRepository(StockTransferDetailMysql)
		private stockTransferDetailRepo: Repository<StockTransferDetailMysql>,
		private productsService: ProductsService,
		private warehousesService: WarehouseService,
		private inventoryService: InventoriesService,
		private userService: UsersService,
	) {}

	async getAll(params: FiltersStockRequestDto) {
		const filters: FilterQuery<StockRequest> = {};
		const {
			sort,
			limit = 10,
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

		const aggregate = [];

		if (filters) {
			aggregate.push({ $match: filters });
		}

		//campos necesarios para traer
		aggregate.push({
			$group: {
				_id: '$_id',
				code: { $first: '$code' },
				observation: { $first: '$observation' },
				observationDestination: { $first: '$observationDestination' },
				observationOrigin: { $first: '$observationOrigin' },
				userIdDestination: { $first: '$userIdDestination' },
				userIdOrigin: { $first: '$userIdOrigin' },
				warehouseOrigin: { $first: '$warehouseOrigin' },
				warehouseDestination: { $first: '$warehouseDestination' },
				detail: { $first: '$detail' },
				status: { $first: '$status' },
				number: { $first: '$number' },
				createdAt: { $first: '$createdAt' },
				updatedAt: { $first: '$updatedAt' },
			},
		});

		if (sort) {
			aggregate.push({ $sort: sort });
		}

		try {

			const result = await this.stockRequestModel
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
			return new NotFoundException(e);
		}
	}

	async getById(id: ObjectId) {
		try {
			const stockRequest = await this.stockRequestModel.findById(id);

			const userDestination = await this.userService.getUserId(
				stockRequest.userIdDestination.toString(),
			);

			//obtiene inventario de cada producto
			//TODO: pendiente cambiar por aggregate cuando se haga el trasalado a mongo

			const detailProducts = stockRequest['_doc'].detail;
			const detail = [];

			for (let i = 0; i < detailProducts.length; i++) {
				const item = detailProducts[i];
				const inventory = await this.inventoryService.getOne(
					item.product,
					stockRequest.warehouseDestination.id,
				);

				detail.push({ ...item, inventory });
			}

			return {
				...stockRequest['_doc'],
				detail,
				userDestination: userDestination,
			};
		} catch (e) {
			return new NotFoundException(e);
		}
	}

	async create(params: CreateStockRequestParamsDto) {
		const {
			products,
			warehouseDestinationId,
			warehouseOriginId,
			observationDestination,
			status = 'open',
			user,
		} = params;

		const productsError = products.find((product) => product.quantity <= 0);

		if (productsError) {
			return new NotFoundException(
				`La solicitud no puede ser creado, la cantidad del producto ${productsError.product_id} no puede ser 0`,
			);
		}

		//consultar productos
		const detail = []; //await this.getDetail(products, status);

		//consultar bodegas
		const warehouseOrigin = await this.warehousesService.getByIdMysql(
			warehouseOriginId,
		);

		const warehouseDestination = await this.warehousesService.getByIdMysql(
			warehouseDestinationId,
		);

		//crear la transferencia
		const newRequest = await this.createStockRequest({
			warehouseOrigin,
			warehouseDestination,
			userIdDestination: user.id,
			detail,
			status,
			observationDestination,
		});

		if (typeof newRequest === 'object') {
			//obtiene inventario de cada producto
			//TODO: pendiente cambiar por aggregate cuando se haga el trasalado a mongo

			const detailProducts = newRequest.detail;
			const detail = [];

			for (let i = 0; i < detailProducts.length; i++) {
				const item = detailProducts[i];
				const inventory = await this.inventoryService.getOne(
					item.product,
					newRequest.warehouseOrigin.id,
				);

				detail.push({ ...item, inventory });
			}

			return { ...newRequest['_doc'], detail: detail['_doc'] };
		} else {
			return new NotFoundException(`Error al crear la solicitud ${newRequest}`);
		}
	}

	async update(id: string, params: UpdateStockRequestParamsDto) {
		const { products, status, user, observation, ...props } = params;
		try {
			//obtenemos los datos para validarlos con los ya guardados
			const stockTransfer = await this.stockRequestModel.findById(id);

			const productsError = products.find((product) => product.quantity <= 0);
			if (
				status === 'open' &&
				(stockTransfer.status !== 'open' || productsError)
			) {
				return new NotFoundException(
					`El traslado ${stockTransfer.number} no puede ser creado`,
				);
			}

			if (
				status === 'pending' &&
				(stockTransfer.status !== 'open' || productsError)
			) {
				return new NotFoundException(
					`El traslado ${stockTransfer.number} no puede ser enviado`,
				);
			}

			if (
				status === 'canceled' &&
				(stockTransfer.status === 'pending' ||
					user.shop !== stockTransfer.warehouseOrigin.shop._id)
			) {
				return new NotFoundException(
					`El traslado ${stockTransfer.number} no puede ser cancelado`,
				);
			}
			if (status === 'open' || status === 'pending') {
				const detail = []; //await this.getDetail(products, status);

				const detailNew = detail.map((item) => {
					const detailOld = stockTransfer.detail.find(
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
							status: 'sent',
							createdAt: new Date(),
							updateAt: new Date(),
						};
					}
				});
				return this.stockRequestModel.findByIdAndUpdate(
					id,
					{
						$set: {
							...props,
							status,
							detail: detailNew,
							userIdOrigin: user.id,
						},
					},
					{ new: true },
				);
			}

			if (status === 'canceled') {
				return this.stockRequestModel.findByIdAndUpdate(
					id,
					{ status, observation },

					{ new: true },
				);
			}
		} catch (e) {
			return new NotFoundException(e);
		}
	}

	/**
	 * @description crea el traslado de mercancía
	 * @param params datos para la creación del traslado
	 */
	async createStockRequest(params: CreateStockRequestDto) {
		try {
			const response = await this.stockRequestModel.create(params);
			return response;
		} catch (e) {
			return e;
		}
	}

	/**
	 * @description crea el traslado de mercancía
	 * @param params datos para la creación del traslado
	 */
	async updateStockRequest(id: ObjectId, params: UpdateStockRequestDto) {
		try {
			const response = await this.stockRequestModel.findByIdAndUpdate(id, {
				$set: params,
			});
			return response;
		} catch (e) {
			return e;
		}
	}

	/**
	 * se encarga de migrar la base de datos de mysql a mongo
	 * @returns true si todo sale bien de lo cotrario un texto
	 */
	async migrate() {
		try {
			const stockTransferData = await this.stockTransferRepo.find({
				type: 'request',
			});

			let ok;
			for (let i = 0; i < stockTransferData.length; i++) {
				const item = stockTransferData[i];
				const warehouseOrigin = await this.warehousesService.getByIdMysql(
					item.warehouse_origin_id,
				);
				const warehouseDestination = await this.warehousesService.getByIdMysql(
					item.warehouse_destination_id,
				);

				const detail = await this.stockTransferDetailRepo.query(
					`SELECT p.reference AS "product.reference",
				p.description AS "product.description",
				p.barcode AS "product.barcode",
				p.changeable AS "product.changeable",
				c.name AS "product.color.name",
				c.name_internal AS "product.color.nameInternal",
				c.active AS "product.color.active",
				c.html AS "product.color.html",
				c.image AS "product.color.image",
				c.id AS "product.color.id",
				s.id AS "product.size.id",
				s.value AS "product.size.value",
				s.active AS "product.size.active",
				pr.name AS "product.provider.name",
				pr.id AS "product.provider.id",
				p.categories AS "product.categories",
				p.price AS "product.price",
				p.cost AS "product.cost",
				p.state AS "product.state",
				p.images AS "product.images",
				p.id AS "product.id",
				u.id AS "product.user.id",
				u.name AS "product.user.name",
				u.shop_id AS "product.user.shop_id",
				u.owner_user_id AS "product.user.owner_user_id",
				u.active AS "product.user.active",
				p.shipping_width AS "product.shipping.width",
				p.shipping_height AS "product.shipping.height",
				p.shipping_long AS "product.shipping.long",
				p.shipping_weight AS "product.shipping.weight",
				p.shipping_volume AS "product.shipping.volume",
				p.\`type\` AS "product.type",
				d.quantity AS "quantity",
				d.quantity_confirmed AS "quantityConfirmed",
				d.status AS "status",
				d.created_at AS "createdAt",
				d.updated_at AS "updateAt"
				FROM stock_transfer_detail d, products p, colors c, sizes s, providers pr,
				users u, warehouses w, stock_transfer st
				WHERE p.color_id = c.id AND s.id = p.size_id AND pr.id = p.provider_id
				AND u.id = p.owner_user_id AND d.product_id = p.id
				AND st.id = d.transfer_id AND st.id = ${item.id}`,
				);

				const detailFormat = detail.map((item) => {
					const {
						quantity,
						quantityConfirmed,
						status,
						createdAt,
						updateAt,
						...productData
					} = item;
					const product = {
						reference: productData['product.reference'],
						description: productData['product.description'],
						barcode: productData['product.barcode'],
						changeable: productData['product.changeable'],
						color: {
							name: productData['product.color.name'],
							nameInternal: productData['product.color.nameInternal'],
							active: productData['product.color.active'],
							html: productData['product.color.html'],
							image: JSON.parse(productData['product.color.image']),
							id: productData['product.color.id'],
						},
						size: {
							id: productData['product.size.id'],
							value: productData['product.size.value'],
							active: productData['product.size.active'],
						},
						provider: {
							name: productData['product.provider.name'],
							id: productData['product.provider.id'],
						},
						categories: productData['product.categories'],
						price: parseInt(productData['product.price']),
						cost: parseInt(productData['product.cost']),
						state: productData['product.state'],
						images: JSON.parse(productData['product.images']) || [],
						id: productData['id'],
					};
					return {
						product,
						quantity,
						quantityConfirmed,
						status,
						createdAt: new Date(createdAt),
						updateAt: new Date(updateAt),
					};
				});

				ok = await this.createStockRequest({
					number: item.id,
					detail: detailFormat,
					warehouseOrigin,
					warehouseDestination,
					userIdDestination: item.destination_user_id,
					status: item.status,
					observationDestination: item.observations_destination,
					code: item.code,
					createdAt: item.created_at,
				});
			}
			if (typeof ok === 'object') {
				return {
					message: 'Todo ha salido bien',
				};
			} else {
				return new NotFoundException(`Error migrando ${ok}`);
			}
		} catch (e) {
			return new NotFoundException(e);
		}
	}

	/**
	 * @description se encarga de consultar los productos y crear el detail
	 * @param products productos a agregar en el detail
	 * @param status estado de los productos
	 * @returns detail para el traslado
	 */
	async getDetail(
		products: {
			product_id: ObjectId;
			quantity: number;
		}[],
		status = 'open',
	) {
		const productsIds = products.map((product) => product.product_id);
		const productsResponse: Product[] =
			await this.productsService.getProductsIdSql(productsIds);

		return productsResponse.map((product) => {
			const prod = products.find((item) => product._id === item.product_id);
			if (prod) {
				return {
					product,
					quantity: prod.quantity,
					status,
					createdAt: new Date(),
					updateAt: new Date(),
				};
			}
			return {
				product,
				quantity: 0,
				status,
				createdAt: new Date(),
				updateAt: new Date(),
			};
		});
	}
}
