import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

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
