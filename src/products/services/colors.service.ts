import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { ResponseColors } from '../dtos/response-colors';
import { FiltersColorsInput } from '../dtos/filters-colors.input';
import { Color } from '../entities/color.entity';
import { CreateColorInput } from '../dtos/create-color.input';
import { UpdateColorInput } from '../dtos/update-color.input';
import { Image } from 'src/configurations/entities/image.entity';
import { User } from 'src/configurations/entities/user.entity';

const populate = [{ path: 'image', model: Image.name }];

@Injectable()
export class ColorsService {
	constructor(
		@InjectModel(Color.name)
		private readonly colorModel: PaginateModel<Color>,
		@InjectModel(Image.name)
		private readonly imageModel: PaginateModel<Image>,
	) {}

	async findAll({
		_id,
		name = '',
		limit = 10,
		page = 1,
		active,
		sort,
	}: FiltersColorsInput): Promise<Partial<ResponseColors>> {
		const filters: FilterQuery<Color> = {};

		if (active !== undefined) {
			filters.active = active;
		}
		if (_id) {
			filters._id = _id;
		}

		const options = {
			limit,
			page,
			lean: true,
			sort,
			populate,
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
		return this.colorModel.findById(id).populate(populate).lean();
	}

	async create({ imageId, ...props }: CreateColorInput, user: User) {
		const color = await this.colorModel
			.findOne({
				name_internal: props.name_internal,
			})
			.lean();

		if (color) {
			throw new NotFoundException('El nombre del color ya existe');
		}

		if (imageId) {
			const image = await this.imageModel.findById(imageId);
			if (!image) {
				throw new NotFoundException('La imagen no existe');
			}
		}

		const newColor = new this.colorModel({
			...props,
			image: imageId,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		return newColor.save();
	}

	async update(
		id: string,
		{ imageId, ...props }: UpdateColorInput,
		user: User,
	) {
		const color = await this.findById(id);

		if (!color) {
			throw new NotFoundException('El color que quiere actualizar no existe');
		}

		const colorName = await this.colorModel.findOne({
			name_internal: props.name_internal,
		});

		if (colorName && colorName._id.toString() !== id) {
			throw new NotFoundException('El nombre del color ya existe');
		}

		if (imageId) {
			const image = await this.imageModel.findById(imageId);
			if (!image) {
				throw new NotFoundException('La imagen no existe');
			}
		}

		return this.colorModel.findByIdAndUpdate(id, {
			...props,
			image: imageId,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});
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
}
