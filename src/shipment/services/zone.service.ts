import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateZoneInput } from '../dtos/create-zone.input';
import { User } from '../../configurations/entities/user.entity';
import { Zone } from '../entities/zone.entity';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { FiltersZoneInput } from '../dtos/filter-zone-input';
import { UpdateZoneInput } from '../dtos/update-zone.input';

const populate = [];

@Injectable()
export class ZoneService {
	constructor(
		@InjectModel(Zone.name) private readonly zoneModel: PaginateModel<Zone>,
	) {}

	async findAll(
		{ name, limit = 10, page = 1, sort }: FiltersZoneInput,
		users: User,
	) {
		const filters: FilterQuery<Zone> = {};

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
			populate,
			sort,
		};

		return this.zoneModel.paginate(filters, options);
	}

	async findOne(filters: FiltersZoneInput) {
		return this.zoneModel.findOne(filters);
	}

	async create({ name, description, state }: CreateZoneInput, users: User) {
		const zone = await this.findOne({ name });

		if (zone) {
			throw new BadRequestException(
				`El nombre del rol '${name}', ya se encuentra asignado`,
			);
		}

		const newZone = new this.zoneModel({
			name: name.toLocaleLowerCase(),
			description: description,
			state: state,
			user: {
				username: users.username,
				name: users.name,
				_id: users._id,
			},
		});

		return await newZone.save();
	}

	async update(
		zoneId: string,
		{ name, description, state }: UpdateZoneInput,
		users: User,
	) {
		if (name) {
			const zone = await this.findOne({ name });

			if (zone && zone._id.toString() !== zoneId) {
				throw new BadRequestException(
					`El nombre de la Zona: '${name}', ya se encuentra asignado`,
				);
			}
		}

		return this.zoneModel.findByIdAndUpdate(
			zoneId,
			{
				$set: {
					name,
					description,
					state,
					user: {
						username: users.username,
						name: users.name,
						_id: users._id,
					},
				},
			},
			{
				lean: true,
				new: true,
				populate,
			},
		);
	}
}
