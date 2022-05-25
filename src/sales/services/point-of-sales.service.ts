import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Box } from 'src/treasury/entities/box.entity';

import { AuthorizationDian } from '../entities/authorization.entity';
import { PointOfSale } from '../entities/pointOfSale.entity';

const populate = [
	{
		path: 'authorization',
		model: AuthorizationDian.name,
	},
	{
		path: 'box',
		model: Box.name,
	},
];

@Injectable()
export class PointOfSalesService {
	constructor(
		@InjectModel(PointOfSale.name)
		private readonly pointOfSaleModel: PaginateModel<PointOfSale>,
	) {}

	async findById(id: string) {
		return this.pointOfSaleModel.findById(id).populate(populate);
	}
}
