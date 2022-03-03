import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { FiltersSizeInput } from '../dtos/filters-size.input';

import { Size, SizeMysql } from '../entities/size.entity';

@Injectable()
export class SizesService {
	constructor(
		@InjectModel(Size.name) private sizeModel: Model<Size>,
		@InjectRepository(SizeMysql)
		private readonly sizeRepo: Repository<SizeMysql>,
	) {}

	async findAll(props: FiltersSizeInput): Promise<Partial<Size>> {
		const { name = '', ...params } = props;
		return this.sizeModel
			.find({ value: { $regex: name, $options: 'i' }, ...params })
			.lean();
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
