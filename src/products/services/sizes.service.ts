import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, PaginateModel } from 'mongoose';
import { Repository } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { CreateSizeInput } from '../dtos/create-size.input';
import { FiltersSizeInput } from '../dtos/filters-size.input';
import { ResponseSize } from '../dtos/response-size';
import { UpdateSizeInput } from '../dtos/update-size.input';
import { Size, SizeMysql } from '../entities/size.entity';

@Injectable()
export class SizesService {
	constructor(
		@InjectModel(Size.name)
		private sizeModel: PaginateModel<Size>,
		@InjectRepository(SizeMysql)
		private readonly sizeRepo: Repository<SizeMysql>,
	) {}

	async findAll({
		name,
		limit = 10,
		page = 1,
		active,
		sort,
	}: FiltersSizeInput): Promise<Partial<ResponseSize>> {
		const filters: FilterQuery<Size> = {};

		if (name) {
			filters.value = { $regex: name, $options: 'i' };
		}

		if (active !== undefined) {
			filters.active = active;
		}

		const options = {
			limit,
			page,
			lean: true,
			sort,
		};

		return this.sizeModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.sizeModel.findById(id).lean();
	}

	async create(props: CreateSizeInput, user: User) {
		const size = await this.sizeModel.findOne({ name: props.name });

		if (!size) {
			throw new NotFoundException('El nombre de la talla ya existe');
		}

		const newSize = new this.sizeModel({ ...props, user });

		return newSize.save();
	}

	async update(id: string, props: UpdateSizeInput, user: User) {
		const size = await this.findById(id);

		if (!size) {
			throw new NotFoundException('La talla que quiere actualizar no existe');
		}

		const sizeName = await this.sizeModel.findOne({ name: props.name });

		if (!sizeName) {
			throw new NotFoundException('El nombre de la talla ya existe');
		}
		return this.sizeModel.findByIdAndUpdate(id, { ...props, user });
	}

	/**
	 * @description se encarga de consultar las tallas por id de mysql
	 * @param id identificador de mysql de la talla
	 * @returns talla
	 */
	async getByIdMysql(id: number) {
		return this.sizeModel.findOne({ id }).lean();
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
