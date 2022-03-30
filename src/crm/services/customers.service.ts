import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';
import { FiltersCustomerInput } from '../dtos/filters-customer-input';

import { Customer } from '../entities/customer.entity';

const populate = [
	{
		path: 'type',
		model: 'CustomerType',
	},
];

@Injectable()
export class CustomersService {
	constructor(
		@InjectModel(Customer.name) private customerModel: PaginateModel<Customer>,
	) {}

	async findAll({
		dato,
		sort,
		active,
		limit = 20,
		page = 1,
	}: FiltersCustomerInput) {
		const filters: FilterQuery<Customer> = {};

		try {
			if (dato) {
				filters.$or = [
					{
						identification: {
							$regex: dato,
							$options: 'i',
						},
						firstName: {
							$regex: dato,
							$options: 'i',
						},
						lastName: {
							$regex: dato,
							$options: 'i',
						},
						email: {
							$regex: dato,
							$options: 'i',
						},
						phone: {
							$regex: dato,
							$options: 'i',
						},
					},
				];
			}

			if (active) {
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
		} catch (error) {
			return error;
		}
		return;
	}

	async findById(id: string) {
		try {
			return this.customerModel.findById(id).populate(populate).lean();
		} catch (error) {
			throw new NotFoundException(`Error al consultar el usuario, ${error}`);
		}
	}

	/**
	 * @description se encargar de seleccionar el cliente por defecto
	 */
	async getCustomerDefault() {
		try {
			return this.customerModel
				.findOne({ isDefault: true })
				.populate(populate)
				.lean();
		} catch (error) {
			return error;
		}
	}

	/**
	 * @description se encargar de seleccionar el cliente asignado a un usuario
	 * @param userId id del usuario
	 */
	async getCustomerAssigning(userId: string) {
		try {
			return this.customerModel
				.findOne({ assigningUser: userId })
				.populate(populate)
				.lean();
		} catch (error) {
			return error;
		}
	}
}
