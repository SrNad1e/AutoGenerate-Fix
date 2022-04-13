import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, Model, PaginateModel } from 'mongoose';
import { Repository } from 'typeorm';
import { FiltersSizeInput } from '../dtos/filters-size.input';
import { ResponseSize } from '../dtos/response-size';

import { Size, SizeMysql } from '../entities/size.entity';

@Injectable()
export class SizesService {
	constructor(
		@InjectModel(Size.name)
		private sizeModel: Model<Size> & PaginateModel<Size>,
		@InjectRepository(SizeMysql)
		private readonly sizeRepo: Repository<SizeMysql>,
	) {}

	async findAll(props: FiltersSizeInput): Promise<Partial<ResponseSize>> {
		const filters: FilterQuery<Size> = {};

		const { name = '', limit = 10, page = 1, active, sort } = props;

		if (active) {
			filters.active = active;
		}

		const options = {
			limit,
			page,
			lean: true,
			sort,
		};

		return this.sizeModel.paginate(
			{
				...filters,
				value: { $regex: name, $options: 'i' },
			},
			options,
		);
	}

	async findById(id: string) {
		return this.sizeModel.findById(id).lean();
	}

	async getByIdMysql(id: number) {
		return this.sizeModel.findOne({ id });
	}

	async migration() {
		try {
			const sizesMysql = await this.sizeRepo.find();

			const sizesMongo = sizesMysql.map((size) => ({
				value: size.value,
				active: size.active,
				id: size.id,
			}));

			await this.sizeModel.create(sizesMongo);

			return {
				message: 'Migración correcta',
			};
		} catch (e) {
			throw new NotFoundException(`Error al migrar las tallas, ${e}`);
		}
	}
}
