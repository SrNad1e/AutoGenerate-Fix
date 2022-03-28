import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomersService {
	constructor(
		@InjectModel(Customer.name) private customerModel: PaginateModel<Customer>,
	) {}

	/**
	 * @description se encargar de seleccionar el cliente por defecto
	 */
	async getCustomerDefault() {
		try {
			return this.customerModel.findOne({ isDefault: true }).lean();
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
			return this.customerModel.findOne({ assigningUser: userId }).lean();
		} catch (error) {
			return error;
		}
	}
}
