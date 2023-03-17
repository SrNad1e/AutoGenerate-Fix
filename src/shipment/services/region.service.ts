import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../configurations/entities/user.entity';
import { Zone } from '../entities/zone.entity';
import { Region } from '../entities/region.entity';
import { FilterQuery, ObjectId, PaginateModel, Types } from 'mongoose';
import { CreateRegionInput } from '../dtos/create-region-input';
import { FiltersRegionInput } from '../dtos/filter-region-input';
import { ZoneService } from './zone.service';
import { FiltersZoneInput } from '../dtos/filter-zone-input';
import { UpdateRegionInput } from '../dtos/update-regions.input';

const populate = [];

@Injectable()
export class regionService {
	constructor(
		@InjectModel(Region.name)
		private readonly regionModel: PaginateModel<Region>,
		private readonly zoneServices: ZoneService,
	) {}

	async findAll(
		{ city, idZones, limit = 10, page = 1, sort }: FiltersRegionInput,
		users: User,
	) {
		const filters: FilterQuery<Zone> = {};

		if (city) {
			filters.city = {
				$regex: city,
				$options: 'i',
			};
		}

		if (idZones) {
			filters.zone._id = new Types.ObjectId(idZones);
		}

		const options = {
			limit,
			page,
			lean: true,
			populate,
			sort,
		};

		return this.regionModel.paginate(filters, options);
	}

	async findOne(filters: FiltersRegionInput) {
		return this.regionModel.findOne(filters);
	}

	async create(
		{ city, dpto, state, country, idZone }: CreateRegionInput,
		users: User,
	) {
		const region = await this.findOne({ city });

		const zone = await this.zoneServices.findOne({
			name: idZone,
		});

		console.log(zone);

		if (region) {
			throw new BadRequestException(
				`El nombre del rol '${region}', ya se encuentra asignado`,
			);
		}

		const newRegion = new this.regionModel({
			city: city,
			dpto: dpto,
			country: country,
			zone: zone,
			state: state,
			user: {
				username: users.username,
				name: users.name,
				_id: users._id,
			},
		});
		return await newRegion.save();
	}

	async update(
		zoneId: string,
		{ city, dpto, state, country, idZone }: UpdateRegionInput,
		users: User,
	) {
		if (city) {
			const region = await this.findOne({ city });

			if (region && region._id.toString() !== zoneId) {
				throw new BadRequestException(
					`El nombre de la Zona: '${name}', ya se encuentra asignado`,
				);
			}
		}

		const zone = await this.zoneServices.findOne({
			name: idZone,
		});

		console.log(zone);

		return this.regionModel.findByIdAndUpdate(
			zoneId,
			{
				$set: {
					city: city,
					dpto: dpto,
					country: country,
					zone: zone,
					state: state,
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
