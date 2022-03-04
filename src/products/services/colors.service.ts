import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, Model, PaginateModel } from 'mongoose';
import { Repository } from 'typeorm';

import { ColorResponse } from '../dtos/color-response';
import { FiltersColorInput } from '../dtos/filters-color.input';
import { Color, ColorMysql } from '../entities/color.entity';

@Injectable()
export class ColorsService {
	constructor(
		@InjectModel(Color.name)
		private readonly colorModel: Model<Color> & PaginateModel<Color>, // & any,
		@InjectRepository(ColorMysql)
		private readonly colorRepo: Repository<ColorMysql>,
	) {}

	async findAll(props: FiltersColorInput): Promise<Partial<ColorResponse>> {
		const filters: FilterQuery<Color> = {};

		const { name = '', limit = 10, skip = 0, active } = props;

		if (active) {
			filters.active = active;
		}

		const options = {
			limit,
			page: skip,
			lean: true,
		};

		return this.colorModel.paginate(
			{
				...filters,
				$or: [
					{ name: { $regex: name, $options: 'i' } },
					{ name_internal: { $regex: name, $options: 'i' } },
				],
			},
			options,
		);
	}

	async getByIdMysql(id: number) {
		return this.colorModel.findOne({ id });
	}

	async migration() {
		try {
			//consultar mysql
			const colorsMysql = await this.colorRepo.find();
			//transformar

			const colorsMongo = colorsMysql.map((color) => {
				const image = JSON.parse(color.image)?.imageSizes.thumbnail;
				return {
					name: color.name,
					name_internal: color.name_internal,
					html: color.html || '#fff',
					id: color.id,
					active: color.active,
					image,
				};
			});

			await this.colorModel.create(colorsMongo);

			return {
				message: 'Migración correcta',
			};
		} catch (e) {
			throw new NotFoundException(`Error al migrar colores, ${e} `);
		}
		//guardar mongo
	}
}
