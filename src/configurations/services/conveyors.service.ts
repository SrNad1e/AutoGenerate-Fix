import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { Image } from 'src/configurations/entities/image.entity';
import { DetailOrder, Order } from 'src/sales/entities/order.entity';
import { FiltersConveyorsInput } from '../dtos/filters-conveyors.input';
import { Conveyor, ConveyorType } from '../entities/conveyor.entity';
import { FedexService } from './fedex.service';

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
		private readonly fedexService: FedexService,
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

		const conveyors = await this.conveyorModel.find().populate(populate);

		return conveyors.map(async (conveyor) => {
			const value = await this.calculateValue(conveyor.type, order as Order);
			return {
				conveyor,
				value,
			};
		});
	}

	async calculateValue(type: ConveyorType, { address, details }: Order) {
		switch (type) {
			case ConveyorType.FEDEX:
				const dimensions = details.map((detail) => ({
					weight: detail.product.reference['shipping.weight'],
					dimensions: {
						length: detail.product.reference['shipping.long'],
						width: detail.product.reference['shipping.width'],
						height: detail.product.reference['shipping.height'],
					},
				}));
				return await this.fedexService.getPrice({
					address: {
						countryCode: address.city.country.prefix,
						postalCode: address.city.defaultPostalCode,
					},
					dimensions,
				});
			default:
				break;
		}
	}
}
