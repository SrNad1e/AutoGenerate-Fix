import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { NotFoundError } from 'rxjs';
import { Repository } from 'typeorm';
import { FiltersColorInput } from '../dtos/filters-color.input';
import { Color, ColorMysql } from '../entities/color.entity';

@Injectable()
export class ColorsService {
	constructor(
		@InjectModel(Color.name) private readonly colorModel: Model<Color>,
		@InjectRepository(ColorMysql)
		private readonly colorRepo: Repository<ColorMysql>,
	) {}

	async findAll(props: FiltersColorInput): Promise<Partial<Color>> {
		const { name = '', ...params } = props;
		return this.colorModel
			.find({ name: { $regex: name, $options: 'i' }, ...params })
			.lean();
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