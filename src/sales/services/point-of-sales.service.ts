import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { Shop } from 'src/configurations/entities/shop.entity';
import { User } from 'src/configurations/entities/user.entity';
import { Box } from 'src/treasury/entities/box.entity';
import { CreatePointOfSaleInput } from '../dtos/create-pointOfSale.input';
import { FiltersPointOfSalesInput } from '../dtos/filters-point-of-sales.input';
import { UpdatePointOfSaleInput } from '../dtos/update-pointOfSale.input';
import { AuthorizationDian } from '../entities/authorization.entity';
import { PointOfSale } from '../entities/pointOfSale.entity';

const populate = [
	{
		path: 'authorization',
		model: AuthorizationDian.name,
	},
	{
		path: 'shop',
		model: Shop.name,
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
		{ shopId, sort, name, _id, limit = 20, page = 1 }: FiltersPointOfSalesInput,
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

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};

		return this.pointOfSaleModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.pointOfSaleModel.findById(id).populate(populate);
	}

	async create(
		{ autorizationId, boxId, name, shopId }: CreatePointOfSaleInput,
		user: User,
		companyId: string,
	) {
		return this.pointOfSaleModel.create({
			name,
			authorization: new Types.ObjectId(autorizationId),
			box: new Types.ObjectId(boxId),
			shop: new Types.ObjectId(shopId),
			user,
			company: new Types.ObjectId(companyId),
		});
	}

	async update(
		id: string,
		{ closeDate }: UpdatePointOfSaleInput,
		user: User,
		companyId: string,
	) {
		const pointOfSale = await this.findById(id);

		if (!pointOfSale) {
			throw new NotFoundException('El punto de venta no existe');
		}

		if (
			user.username !== 'admin' &&
			pointOfSale.company.toString() !== companyId
		) {
			throw new UnauthorizedException(
				'No está autorizado para hacer cambios en ese punto de venta',
			);
		}

		return this.pointOfSaleModel.findByIdAndUpdate(id, {
			$set: {
				closeDate,
				user,
			},
		});
	}
}
