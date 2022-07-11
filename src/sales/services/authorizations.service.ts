import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { CreateAuthorizationInput } from '../dtos/create-authorization.input';
import { FiltersAuthorizationInput } from '../dtos/filters-authorization.input';
import { UpdateAuthorizationInput } from '../dtos/update-authorization.input';
import { AuthorizationDian } from '../entities/authorization.entity';

@Injectable()
export class AuthorizationsService {
	constructor(
		@InjectModel(AuthorizationDian.name)
		private readonly authorizationModel: PaginateModel<AuthorizationDian>,
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
		};

		return this.authorizationModel.paginate(filters, options);
	}

	async create(
		params: CreateAuthorizationInput,
		user: User,
		companyId: string,
	) {
		return this.authorizationModel.create({
			...params,
			user,
			company: new Types.ObjectId(companyId),
		});
	}

	async update(
		id: string,
		params: UpdateAuthorizationInput,
		user: User,
		companyId: string,
	) {
		const authorization = await this.authorizationModel.findById(id);

		if (!authorization) {
			throw new BadRequestException('La autorización no existe');
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
				user,
			},
		});
	}
}
