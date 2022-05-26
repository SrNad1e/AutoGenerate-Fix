import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { Box } from 'src/treasury/entities/box.entity';
import { User } from 'src/users/entities/user.entity';

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

	async findAll(
		{ shopId, sort, limit = 20, page = 1 }: any,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<PointOfSale> = {};
		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (shopId) {
			filters.shop = new Types.ObjectId(shopId);
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.pointOfSaleModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.pointOfSaleModel.findById(id).populate(populate);
	}
}
