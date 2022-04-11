import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateCompanyInput } from '../dtos/create-company.input';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompaniesService {
	constructor(
		@InjectModel(Company.name)
		private readonly companyModel: PaginateModel<Company>,
	) {}

	async create({}: CreateCompanyInput, user: User) {}
}
