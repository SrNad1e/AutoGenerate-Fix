import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { FiltersRolInput } from '../dtos/filters-rol.input';

import { Role } from '../entities/role.entity';

@Injectable()
export class RolesService {
	constructor(
		@InjectModel(Role.name) private readonly roleModel: PaginateModel<Role>,
	) {}

	async findById(id: string) {
		return this.roleModel.findById(id).lean();
	}

	async findOne(filters: FiltersRolInput) {
		return this.roleModel.findOne(filters).lean();
	}
}
