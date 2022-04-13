import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { CreateBrandInput } from '../dtos/create-brand.input';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandsService {
	constructor(
		@InjectModel(Brand.name) private readonly brandModel: PaginateModel<Brand>,
	) {}

	async findById(id: string) {
		return this.brandModel.findById(id).lean();
	}

	async findOne(name: string) {
		return this.brandModel.findOne({ name }).lean();
	}

	async create({ name }: CreateBrandInput, user: Partial<User>) {
		return this.brandModel.create({
			name,
			user,
		});
	}
}
