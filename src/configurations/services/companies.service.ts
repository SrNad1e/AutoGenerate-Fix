import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';

import { CreateCompanyInput } from '../dtos/create-company.input';
import { FiltersCompaniesInput } from '../dtos/filters-companies.input';
import { UpdateCompanyInput } from '../dtos/update-company.input';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompaniesService {
	constructor(
		@InjectModel(Company.name)
		private readonly companyModel: PaginateModel<Company>,
	) {}

	async findAll({
		active,
		limit = 10,
		name,
		page = 1,
		sort,
	}: FiltersCompaniesInput) {
		const filters: FilterQuery<Company> = {};
		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (active !== undefined) {
			filters.active = active;
		}

		const options = {
			limit,
			sort,
			page,
			lean: true,
		};

		return this.companyModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.companyModel.findById(id).lean();
	}

	async findOne(name: string) {
		return this.companyModel.findOne({ name }).lean();
	}

	async create(params: CreateCompanyInput, user: User) {
		if (user.username !== 'admin') {
			throw new UnauthorizedException('El usuario no esta autorizado');
		}

		return this.companyModel.create({
			...params,
			user,
		});
	}

	async update(id: string, params: UpdateCompanyInput, user: User) {
		if (user.username !== 'admin') {
			throw new UnauthorizedException('El usuario no esta autorizado');
		}

		return this.companyModel.findByIdAndUpdate(id, {
			$set: {
				...params,
				user,
			},
		});
	}
}
