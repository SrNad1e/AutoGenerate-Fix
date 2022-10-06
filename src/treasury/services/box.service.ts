import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { CreateBoxInput } from '../dtos/create-box.input';
import { FiltersBoxesInput } from '../dtos/filters-boxes.input';
import { UpdateBoxInput } from '../dtos/update-box.input';
import { Box } from '../entities/box.entity';

@Injectable()
export class BoxService {
	constructor(
		@InjectModel(Box.name) private readonly boxModel: PaginateModel<Box>,
	) {}

	async findAll(
		{ _id, name, limit = 10, page = 1, sort }: FiltersBoxesInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Box> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.boxModel.paginate(filters, options);
	}

	async findOne({ _id, name, isMain }: FiltersBoxesInput, companyId: string) {
		const filters: FilterQuery<Box> = {};

		filters.company = new Types.ObjectId(companyId);

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (isMain) {
			filters.isMain = isMain;
		}

		return this.boxModel.findOne(filters);
	}

	async findById(id: string) {
		return this.boxModel.findById(id).lean();
	}

	async updateTotal(id: string, total: number) {
		return this.boxModel.findByIdAndUpdate(
			id,
			{
				$set: {
					total,
				},
			},
			{
				new: true,
				lean: true,
			},
		);
	}

	async create(params: CreateBoxInput, user: User, companyId: string) {
		return this.boxModel.create({
			...params,
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
		params: UpdateBoxInput,
		user: User,
		companyId: string,
	) {
		const box = await this.findById(id);

		if (!box) {
			throw new BadRequestException('La caja no existe');
		}

		if (box.company.toString() !== companyId) {
			throw new UnauthorizedException(
				'El usuario no tiene permisos para actualizar esta caja',
			);
		}

		return this.boxModel.findByIdAndUpdate(id, {
			$set: {
				...params,
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
			},
		});
	}
}
