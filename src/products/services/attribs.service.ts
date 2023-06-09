import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, FilterQuery, Types } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';
import { CreateAttribInput } from '../dtos/create-attrib.input';
import { FiltersAttribsInput } from '../dtos/filters-attribs.input';
import { UpdateAttribInput } from '../dtos/update-attrib.input';
import { Attrib } from '../entities/attrib.entity';

@Injectable()
export class AttribsService {
	constructor(
		@InjectModel(Attrib.name)
		private readonly attribModel: PaginateModel<Attrib>,
	) {}

	async findAll({
		_ids,
		active,
		limit = 10,
		page = 1,
		sort,
		name,
	}: FiltersAttribsInput) {
		const filters: FilterQuery<Attrib> = {};

		if (active !== undefined) {
			filters.active = active;
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (_ids) {
			filters._id = {
				$in: _ids.map((id) => new Types.ObjectId(id)),
			};
		}

		const options = {
			limit,
			page,
			lean: true,
			sort,
		};

		return this.attribModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.attribModel.findById(id).lean();
	}

	async create(props: CreateAttribInput, user: User) {
		const attrib = await this.attribModel.findOne({
			name: props.name,
		});

		if (attrib) {
			throw new NotFoundException('El nombre del atributo ya existe');
		}

		const newAttrib = new this.attribModel({
			...props,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		return newAttrib.save();
	}

	async update(id: string, props: UpdateAttribInput, user: User) {
		const attrib = await this.findById(id);

		if (!attrib) {
			throw new NotFoundException('El attrib que quiere actualizar no existe');
		}

		const attribName = await this.attribModel.findOne({
			name: props.name,
		});

		if (attribName && id !== attribName._id.toString()) {
			throw new NotFoundException('El nombre del atributo ya existe');
		}
		return this.attribModel.findByIdAndUpdate(id, {
			...props,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});
	}
}
