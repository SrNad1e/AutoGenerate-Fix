import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateBrandInput } from '../dtos/create-brand.input';
import { FiltersAttribsInput } from '../dtos/filters-attribs.input';
import { UpdateBrandInput } from '../dtos/update-brand.input';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandsService {
	constructor(
		@InjectModel(Brand.name) private readonly brandModel: PaginateModel<Brand>,
	) {}

	async findAll({
		active,
		limit = 10,
		page = 1,
		sort,
		name,
	}: FiltersAttribsInput) {
		const filters: FilterQuery<Brand> = {};

		if (active) {
			filters.active = active;
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
		if (!brand) {
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

		if (!attribName) {
			throw new NotFoundException('El nombre de la marca ya existe');
		}
		return this.brandModel.findByIdAndUpdate(id, { ...props, user });
	}
}
