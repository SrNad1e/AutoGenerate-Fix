import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../configurations/entities/user.entity';
import { Zone } from '../entities/zone.entity';
import { Region } from '../entities/region.entity';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { CreateRegionInput } from '../dtos/create-region-input';
import { FiltersRegionInput } from '../dtos/filter-region-input';

const populate = [];

@Injectable()
export class regionService {
	constructor(
		@InjectModel(Region.name)
		private readonly regionModel: PaginateModel<Region>,
		private readonly zoneModel: PaginateModel<Zone>,
	) {}

	async findOne(filters: FiltersRegionInput) {
		return this.regionModel.findOne(filters);
	}

	async findOneZone(filters) {
		return this.zoneModel.findOne(filters);
	}

	async create(
		{ city, dpto, state, country, zoneId }: CreateRegionInput,
		users: User,
	) {
		const region = await this.findOne({ city });

		const zone = await this.findOneZone({ name: zoneId });


        console.log(zoneId)

		if (region) {
			throw new BadRequestException(
				`El nombre del rol '${region}', ya se encuentra asignado`,
			);
		}

		const newZone = new this.regionModel({
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

		return 'Hola mundo';
	}
}
