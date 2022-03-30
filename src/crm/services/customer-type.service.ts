import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { CustomerType } from '../entities/customerType.entity';

@Injectable()
export class CustomerTypeService {
	constructor(
		@InjectModel(CustomerType.name)
		private readonly customerTypeModel: PaginateModel<CustomerType>,
	) {}

	async findById(id: string) {
		try {
			return this.customerTypeModel.findById(id);
		} catch (error) {
			throw new NotFoundException(
				`Error al consultar tipo de cliente, ${error}`,
			);
		}
	}
}
