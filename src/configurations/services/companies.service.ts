import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { User } from 'src/configurations/entities/user.entity';

import { CreateCompanyInput } from '../dtos/create-company.input';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompaniesService {
	constructor(
		@InjectModel(Company.name)
		private readonly companyModel: PaginateModel<Company>,
	) {}

	async findById(id: string) {
		return this.companyModel.findById(id).lean();
	}

	async findOne(name: string) {
		return this.companyModel.findOne({ name }).lean();
	}

	async create({}: CreateCompanyInput, user: User) {}
}
