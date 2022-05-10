import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { Order } from 'src/sales/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
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
		private readonly documentTypesService: DocumentTypesService,
		private readonly customerTypeService: CustomerTypeService,
		private readonly citiesService: CitiesService,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
	) {}

	async findAll({
		dato,
		sort,
		active,
		limit = 20,
		page = 1,
	}: FiltersCustomersInput) {
		const filters: FilterQuery<Customer> = {};

		if (dato) {
			filters.$or = [
				{
					identification: {
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

	async create({
		documentTypeId,
		customerTypeId,
		document,
		...params
	}: CreateCustomerInput) {
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

		const customerType = await this.customerTypeService.findById(
			customerTypeId,
		);

		if (!customerType) {
			throw new NotFoundException('El tipo de cliente no existe');
		}

		const newCustomer = new this.customerModel({
			documentType: documentType._id,
			document,
			customerType: customerType._id,
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

		if (addresses) {
			for (let i = 0; i < addresses.length; i++) {
				const { cityId, ...params } = addresses[i];
				const city = await this.citiesService.findById(cityId);
				if (!city) {
					throw new NotFoundException('Una de las ciudades no existe');
				}
				newAddresses.push({
					...params,
					city,
				});
			}
		}

		console.log(newAddresses);

		const newCustomer = await this.customerModel.findByIdAndUpdate(
			{ _id: id },
			{
				$set: {
					customerTypeId,
					document,
					documentTypeId,
					user,
					addresses: newAddresses.length > 0 ? newAddresses : undefined,
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
					$set: {
						customer: id,
						status: {
							$in: ['open', 'pending'],
						},
					},
				},
				{
					customer: newCustomer,
					user,
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
}
