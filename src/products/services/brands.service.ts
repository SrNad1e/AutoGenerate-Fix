import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { User } from 'src/configurations/entities/user.entity';

import { CreateBrandInput } from '../dtos/create-brand.input';
import { FiltersBrandsInput } from '../dtos/filters-brands.input';
import { UpdateBrandInput } from '../dtos/update-brand.input';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandsService {
	constructor(
		@InjectModel(Brand.name) private readonly brandModel: PaginateModel<Brand>,
	) {}

	async findAll({
		_id,
		active,
		limit = 10,
		page = 1,
		sort,
		name,
	}: FiltersBrandsInput) {
		const filters: FilterQuery<Brand> = {};

		if (active !== undefined) {
			filters.active = active;
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
			lean: true,
			sort,
		};

		return this.brandModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.brandModel.findById(id).lean();
	}

	async findOne(name: string) {
		return this.brandModel.findOne({ name }).lean();
	}

	async create(props: CreateBrandInput, user: Partial<User>) {
		const brand = await this.findOne(props.name);
		if (brand) {
			throw new NotFoundException('La marca ya se encuentra registrada');
		}
		const newBrand = new this.brandModel({
			...props,
			user,
		});

		return newBrand.save();
	}

	async update(id: string, props: UpdateBrandInput, user: User) {
		const brand = await this.findById(id);

		if (!brand) {
			throw new NotFoundException('La marca que quiere actualizar no existe');
		}

		const attribName = await this.brandModel.findOne({
			name: props.name,
		});

		if (attribName && id !== attribName._id.toString()) {
			throw new NotFoundException('El nombre de la marca ya existe');
		}
		return this.brandModel.findByIdAndUpdate(id, { ...props, user });
	}
}
