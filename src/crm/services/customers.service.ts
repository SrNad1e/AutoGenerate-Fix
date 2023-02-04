import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { Order, StatusOrder } from 'src/sales/entities/order.entity';
import { CreateCustomerInput } from '../dtos/create-customer.input';
import { FiltersCustomerInput } from '../dtos/filters-customer.input';
import { FiltersCustomersInput } from '../dtos/filters-customers.input';
import { UpdateCustomerInput } from '../dtos/update-customer.input';
import { Customer } from '../entities/customer.entity';
import { CustomerType } from '../entities/customerType.entity';
import { DocumentType } from '../entities/documentType.entity';
import { CitiesService } from './cities.service';
import { CustomerTypeService } from './customer-type.service';
import { DocumentTypesService } from './document-types.service';

const populate = [
	{
		path: 'customerType',
		model: CustomerType.name,
	},
	{
		path: 'documentType',
		model: DocumentType.name,
	},
];

@Injectable()
export class CustomersService {
	constructor(
		@InjectModel(Customer.name)
		private readonly customerModel: PaginateModel<Customer>,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
		private readonly documentTypesService: DocumentTypesService,
		private readonly customerTypeService: CustomerTypeService,
		private readonly citiesService: CitiesService,
	) {}

	async findAll({
		dato,
		_id,
		sort,
		active,
		limit = 20,
		page = 1,
	}: FiltersCustomersInput) {
		const filters: FilterQuery<Customer> = {};

		if (dato) {
			filters.$or = [
				{
					document: {
						$regex: dato,
						$options: 'i',
					},
				},
				{
					firstName: {
						$regex: dato,
						$options: 'i',
					},
				},
				{
					lastName: {
						$regex: dato,
						$options: 'i',
					},
				},
				{
					email: {
						$regex: dato,
						$options: 'i',
					},
				},
			];
		}

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (active !== undefined) {
			filters.active = active;
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		return this.customerModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.customerModel.findById(id).populate(populate).lean();
	}

	async findOne({ document }: FiltersCustomerInput) {
		const filters: FilterQuery<Customer> = {};
		if (document) {
			filters.document = document;
		}

		return this.customerModel.findOne(filters).lean();
	}

	async create(
		{
			documentTypeId,
			customerTypeId,
			document,
			...params
		}: CreateCustomerInput,
		user: User,
	) {
		const customer = await this.customerModel.findOne({ document });

		if (customer) {
			throw new NotFoundException('El cliente ya se encuentra registrado');
		}

		const documentType = await this.documentTypesService.findById(
			documentTypeId,
		);

		if (!documentType) {
			throw new NotFoundException('El tipo de documento no existe');
		}
		let customerType;
		if (customerTypeId) {
			customerType = await this.customerTypeService.findById(customerTypeId);
			if (!customerType) {
				throw new NotFoundException('El tipo de cliente no existe');
			}
		} else {
			customerType = await this.customerTypeService.findOne('Detal');
		}

		const newCustomer = new this.customerModel({
			documentType: documentType._id,
			document,
			customerType: customerType._id,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			...params,
		});

		return (await newCustomer.save()).populate(populate);
	}

	async update(
		id: string,
		{
			customerTypeId,
			document,
			documentTypeId,
			addresses,
			...params
		}: UpdateCustomerInput,
		user: User,
	) {
		const customer = await this.findById(id);

		if (!customer) {
			throw new NotFoundException('El cliente no existe');
		}

		if (customerTypeId) {
			const customerType = this.customerTypeService.findById(customerTypeId);

			if (!customerType) {
				throw new NotFoundException('El tipo de cliente no existe');
			}
		}

		if (document) {
			const customerDocument = await this.findOne({ document });

			if (customerDocument && customerDocument._id.toString() !== id) {
				throw new NotFoundException('Documento pertenece a otro cliente');
			}
		}

		if (documentTypeId) {
			const documentType = await this.documentTypesService.findById(
				documentTypeId,
			);

			if (!documentType) {
				throw new NotFoundException('El tipo de documento no existe');
			}
		}

		const newAddresses = [];

		if (addresses?.length > 0) {
			let isMainIndex = 0;
			for (let i = 0; i < addresses.length; i++) {
				const { cityId, isMain, ...params } = addresses[i];
				const city = await this.citiesService.findById(cityId);
				if (!city) {
					throw new NotFoundException('Una de las ciudades no existe');
				}

				if (isMain) {
					isMainIndex = i;
				}

				newAddresses.push({
					...params,
					isMain: false,
					city,
				});
			}
			newAddresses[isMainIndex] = {
				...newAddresses[isMainIndex],
				isMain: true,
			};
		}

		const customerType = await this.customerTypeService.findOne('Mayorista');

		let wolesalerDate;
		let firstPurchase = false;
		//validar que el usuario se valla a actuvar como mayorista

		if (customerTypeId === customerType._id.toString()) {
			wolesalerDate = new Date();
			firstPurchase = true;
		}

		const newCustomer = await this.customerModel.findByIdAndUpdate(
			{ _id: id },
			{
				$set: {
					customerType: customerTypeId
						? new Types.ObjectId(customerTypeId)
						: undefined,
					document,
					documentTypeId: documentTypeId
						? new Types.ObjectId(documentTypeId)
						: undefined,
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
					},
					addresses: newAddresses.length > 0 ? newAddresses : undefined,
					wolesalerDate,
					firstPurchase,
					...params,
				},
			},
			{
				new: true,
				populate,
				lean: true,
			},
		);

		if (newCustomer) {
			await this.orderModel.updateMany(
				{
					'customer._id': new Types.ObjectId(id),
					status: {
						$in: [StatusOrder.OPEN, StatusOrder.PENDDING],
					},
				},
				{
					customer: newCustomer,
				},
			);
		}

		return newCustomer;
	}

	/**
	 * @description se encargar de seleccionar el cliente por defecto
	 */
	async getCustomerDefault() {
		return this.customerModel
			.findOne({ isDefault: true })
			.populate(populate)
			.lean();
	}

	/**
	 * @description se encargar de seleccionar el cliente asignado a un usuario
	 * @param userId id del usuario
	 */
	async getCustomerAssigning(userId: string) {
		return this.customerModel
			.findOne({ assigningUser: userId })
			.populate(populate)
			.lean();
	}

	/**
	 * @description se encargar de pasar a detal a los clientes que no cumplen con la meta mensual
	 */
	@Cron('* * 22 * * *')
	async processWolesaler() {
		const customerTypeWholesaler = await this.customerTypeService.findOne(
			'Mayorista',
		);
		const customerTypeDetal = await this.customerTypeService.findOne('Detal');

		const customersValidate = [];

		const customersSixty = await this.customerModel.find({
			customerType: customerTypeWholesaler._id,
			firstPurchase: true,
		});

		customersSixty.forEach((customer) => {
			const dateNow = dayjs(customer.wolesalerDate);
			const diffTime = dayjs().diff(dateNow, 'day');

			if (diffTime >= 60) {
				customersValidate.push(customer);
			}
		});

		const customersThirty = await this.customerModel.find({
			customerType: customerTypeWholesaler._id,
			firstPurchase: false,
		});

		customersThirty.forEach((customer) => {
			const dateNow = dayjs(customer.wolesalerDate);
			const diffTime = dayjs().diff(dateNow, 'day');

			if (diffTime >= 30) {
				customersValidate.push(customer);
			}
		});

		for (let i = 0; i < customersValidate.length; i++) {
			const { _id } = customersValidate[i];

			const initialDate = dayjs().subtract(30, 'day').format('YYYY/MM/DD');
			const finalDate = dayjs().add(1, 'day').format('YYYY/MM/DD');

			const orders = await this.orderModel.find({
				'customer._id': _id,
				status: StatusOrder.CLOSED,
				createdAt: {
					$gte: new Date(initialDate),
					$lte: new Date(finalDate),
				},
			});

			const total = orders.reduce((acc, order) => acc + order.summary.total, 0);

			if (total >= 200000) {
				await this.customerModel.findByIdAndUpdate(_id, {
					$set: {
						wolesalerDate: new Date(),
						firstPurchase: false,
					},
				});
			} else {
				await this.customerModel.findByIdAndUpdate(_id, {
					$set: {
						customerType: customerTypeDetal._id,
						firstPurchase: false,
					},
				});
			}
		}
	}
}
