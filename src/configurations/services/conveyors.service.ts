import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { Image } from 'src/configurations/entities/image.entity';
import { Order } from 'src/sales/entities/order.entity';
import { FiltersConveyorsInput } from '../dtos/filters-conveyors.input';
import { Conveyor } from '../entities/conveyor.entity';

const populate = [
	{
		path: 'logo',
		model: Image.name,
	},
];

@Injectable()
export class ConveyorsService {
	constructor(
		@InjectModel(Conveyor.name)
		private readonly conveyorModel: PaginateModel<Conveyor>,
		@InjectModel(Order.name)
		private readonly orderModel: PaginateModel<Order>,
	) {}

	async findAll({ sort, limit = 10, name, page = 1 }: FiltersConveyorsInput) {
		const filters: FilterQuery<Conveyor> = {};

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		const options = {
			sort,
			limit,
			page,
			lean: true,
			populate,
		};

		return this.conveyorModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.conveyorModel.findById(id).populate(populate).lean();
	}

	async getAllByOrder(orderId: string) {
		const order = await this.orderModel.findById(orderId);

		if (!order) {
			throw new BadRequestException('El pedido no existe');
		}

		const conveyors = await this.conveyorModel.find();

		//TODO: aca se deben realizar todos los calculos para cada uno de los transportistas

		return conveyors.map((conveyor) => ({
			conveyor,
			value: 0,
		}));
	}
}
