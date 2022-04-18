import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterQuery, PaginateModel } from 'mongoose';
import { Repository } from 'typeorm';

import { ResponseColor } from '../dtos/response-color';
import { FiltersColorInput } from '../dtos/filters-colors.input';
import { Color, ColorMysql } from '../entities/color.entity';
import { CreateColorInput } from '../dtos/create-color.input';
import { User } from 'src/users/entities/user.entity';
import { UpdateColorInput } from '../dtos/update-color.input';

@Injectable()
export class ColorsService {
	constructor(
		@InjectModel(Color.name)
		private readonly colorModel: PaginateModel<Color>,
		@InjectRepository(ColorMysql)
		private readonly colorRepo: Repository<ColorMysql>,
	) {}

	async findAll({
		name = '',
		limit = 10,
		page = 1,
		active,
		sort,
	}: FiltersColorInput): Promise<Partial<ResponseColor>> {
		const filters: FilterQuery<Color> = {};

		if (active) {
			filters.active = active;
		}

		const options = {
			limit,
			page,
			lean: true,
			sort,
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

	async findById(id: string) {
		return this.colorModel.findById(id).lean();
	}

	async create(props: CreateColorInput, user: User) {
		const color = await this.colorModel.findOne({
			name_internal: props.name_internal,
		});

		if (!color) {
			throw new NotFoundException('El nombre del color ya existe');
		}

		const newColor = new this.colorModel({ ...props, user });

		return newColor.save();
	}

	async update(id: string, props: UpdateColorInput, user: User) {
		const color = await this.findById(id);

		if (!color) {
			throw new NotFoundException('El color que quiere actualizar no existe');
		}

		const colorName = await this.colorModel.findOne({
			name_internal: props.name_internal,
		});

		if (!colorName) {
			throw new NotFoundException('El nombre del color ya existe');
		}
		return this.colorModel.findByIdAndUpdate(id, { ...props, user });
	}

	/**
	 * @description busca el color por el id de mysql
	 * @deprecated ya no se va a usar, solo para migraciones
	 * @param id identificador de mysql del color
	 * @returns color
	 */
	async getByIdMysql(id: number) {
		return this.colorModel.findOne({ id }).lean();
	}

	async migration() {
		try {
			const colorsMysql = await this.colorRepo.find();

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
	}
}
