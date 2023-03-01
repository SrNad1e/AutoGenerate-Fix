import { CategoryLevel1 } from 'src/products/entities/category-level1.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';

import { CreateCompanyInput } from '../dtos/create-company.input';
import { FiltersCompaniesInput } from '../dtos/filters-companies.input';
import { UpdateCompanyInput } from '../dtos/update-company.input';
import { Company } from '../entities/company.entity';
import { CategoryLevel2 } from 'src/products/entities/category-level2.entity';
import { CategoryLevel3 } from 'src/products/entities/category-level3.entity';

@Injectable()
export class CompaniesService {
	constructor(
		@InjectModel(Company.name)
		private readonly companyModel: PaginateModel<Company>,
		@InjectModel(CategoryLevel1.name)
		private readonly categoryLevel1: PaginateModel<CategoryLevel1>,
		@InjectModel(CategoryLevel2.name)
		private readonly categoryLevel2: PaginateModel<CategoryLevel2>,
		@InjectModel(CategoryLevel3.name)
		private readonly categoryLevel3: PaginateModel<CategoryLevel3>,
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

		const newCompany = await this.companyModel.create({
			...params,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		const companyMain = await this.companyModel.findOne({ main: true });

		await this.categoryLevel1.updateMany(
			{
				companies: companyMain._id,
			},
			{
				$push: {
					companies: newCompany?._id,
				},
			},
		);

		await this.categoryLevel2.updateMany(
			{
				companies: companyMain._id,
			},
			{
				$push: {
					companies: newCompany?._id,
				},
			},
		);

		await this.categoryLevel3.updateMany(
			{
				companies: companyMain._id,
			},
			{
				$push: {
					companies: newCompany?._id,
				},
			},
		);
	}

	async update(id: string, params: UpdateCompanyInput, user: User) {
		if (user.username !== 'admin') {
			throw new UnauthorizedException('El usuario no esta autorizado');
		}

		return this.companyModel.findByIdAndUpdate(id, {
			$set: {
				...params,
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
			},
		});
	}
}
