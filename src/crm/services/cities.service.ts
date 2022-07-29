import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';
import { ZoneType } from 'src/configurations/entities/conveyor.entity';

import { User } from 'src/configurations/entities/user.entity';
import { CreateCityInput } from '../dtos/create-city.input';
import { FiltersCitiesInput } from '../dtos/filters-cities-input';
import { UpadteCityInput } from '../dtos/update-city.input';
import { City } from '../entities/city.entity';

@Injectable()
export class CitiesService {
	constructor(
		@InjectModel(City.name) private readonly cityModel: PaginateModel<City>,
	) {}

	async findAll({
		sort,
		limit = 10,
		page = 1,
		_id,
		country,
		name,
		state,
	}: FiltersCitiesInput) {
		const filters: FilterQuery<City> = {};

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (state) {
			filters.state = {
				$regex: state,
				$options: 'i',
			};
		}

		if (country) {
			filters.country = {
				$regex: country,
				$options: 'i',
			};
		}

		const options = {
			limit,
			page,
			sort,
			lean: true,
		};

		return this.cityModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.cityModel.findById(id).lean();
	}

	async create(
		{
			zone,
			countryPrefix,
			countryName,
			defaultPostalCode,
			code,
			...params
		}: CreateCityInput,
		user: User,
	) {
		if (code.length !== 8) {
			throw new BadGatewayException('Código DANE erroneo');
		}

		if (defaultPostalCode.length !== 6) {
			throw new BadGatewayException('Código postal erroneo');
		}

		const city = await this.cityModel.findOne({
			code,
		});

		if (city) {
			throw new BadGatewayException('La ciudad que intenta crear ya existe');
		}

		return this.cityModel.create({
			...params,
			zone: ZoneType[zone],
			code,
			defaultPostalCode,
			country: {
				name: countryName,
				prefix: countryPrefix,
			},
			user,
		});
	}

	async update(
		id: string,
		{
			zone,
			code,
			defaultPostalCode,
			countryName,
			countryPrefix,
			...params
		}: UpadteCityInput,
		user: User,
	) {
		if (code.length !== 8) {
			throw new BadGatewayException('Código DANE erroneo');
		}

		if (defaultPostalCode.length !== 6) {
			throw new BadGatewayException('Código postal erroneo');
		}
		const city = await this.findById(id);

		if (!city) {
			throw new BadGatewayException('La ciudad no existe');
		}

		return this.cityModel.findByIdAndUpdate(
			id,
			{
				...params,
				zone: ZoneType[zone],
				code,
				defaultPostalCode,
				country: {
					name: countryName,
					prefix: countryPrefix,
				},
				user,
			},
			{
				lean: true,
				new: true,
			},
		);
	}
}
