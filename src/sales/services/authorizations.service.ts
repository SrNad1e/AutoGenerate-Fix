import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { ShopsService } from 'src/configurations/services/shops.service';
import { CreateAuthorizationInput } from '../dtos/create-authorization.input';
import { FiltersAuthorizationInput } from '../dtos/filters-authorization.input';
import { UpdateAuthorizationInput } from '../dtos/update-authorization.input';
import { AuthorizationDian } from '../entities/authorization.entity';

const populate = [
	{
		path: 'shop',
		model: 'Shops',
	},
];

@Injectable()
export class AuthorizationsService {
	constructor(
		@InjectModel(AuthorizationDian.name)
		private readonly authorizationModel: PaginateModel<AuthorizationDian>,
		private readonly shopsService: ShopsService,
	) {}

	async findAll(
		{ prefix, limit = 10, page = 1, sort }: FiltersAuthorizationInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<AuthorizationDian> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (prefix) {
			filters.prefix = prefix;
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		return this.authorizationModel.paginate(filters, options);
	}

	async create(
		{ shopId, ...params }: CreateAuthorizationInput,
		user: User,
		companyId: string,
	) {
		const shop = await this.shopsService.findById(shopId);

		if (!shop) {
			throw new BadRequestException('La tienda no existe');
		}

		return this.authorizationModel.create({
			...params,
			shop: shop._id,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			company: new Types.ObjectId(companyId),
		});
	}

	async update(
		id: string,
		{ shopId, ...params }: UpdateAuthorizationInput,
		user: User,
		companyId: string,
	) {
		const authorization = await this.authorizationModel.findById(id);

		if (!authorization) {
			throw new BadRequestException('La autorización no existe');
		}
		let shop;
		if (shopId) {
			shop = await this.shopsService.findById(shopId);

			if (!shop) {
				throw new BadRequestException('La tienda no existe');
			}
		}

		if (
			user.username !== 'admin' &&
			authorization?.company.toString() !== companyId
		) {
			throw new UnauthorizedException(
				'El usuario no puede modificar la autorización',
			);
		}

		return this.authorizationModel.findByIdAndUpdate(id, {
			$set: {
				...params,
				shop: shop._id,
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
			},
		});
	}
}
