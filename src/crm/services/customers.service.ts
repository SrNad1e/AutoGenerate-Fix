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
}
