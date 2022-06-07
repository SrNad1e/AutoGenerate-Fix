import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel } from 'mongoose';
import { CreateRoleInput } from '../dtos/create-role.input';

import { FiltersRoleInput } from '../dtos/filters-role.input';
import { FiltersRolesInput } from '../dtos/filters-roles.input';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { PermissionsService } from './permissions.service';

const populate = [
	{
		path: 'permissions',
		model: Permission.name,
	},
];

@Injectable()
export class RolesService {
	constructor(
		@InjectModel(Role.name) private readonly roleModel: PaginateModel<Role>,
		private readonly permissionsService: PermissionsService,
	) {}

	async findAll({
		active,
		name,
		limit = 10,
		page = 1,
		sort,
	}: FiltersRolesInput) {
		const filters: FilterQuery<Role> = {};

		if (active !== undefined) {
			filters.active = active;
		}

		if (name) {
			filters.name = name;
		}

		const options = {
			limit,
			page,
			lean: true,
			populate,
			sort,
		};

		return this.roleModel.paginate(filters, options);
	}

	async findById(id: string) {
		return this.roleModel.findById(id).populate(populate).lean();
	}

	async findOne(filters: FiltersRoleInput) {
		return this.roleModel.findOne(filters).populate(populate).lean();
	}

	async create({
		active,
		changeWarehouse,
		name,
		permissionIds,
	}: CreateRoleInput) {
		const permissions = [];

		for (let i = 0; i < permissionIds.length; i++) {
			const permissionId = permissionIds[i];
			const permission = await this.permissionsService.findById(permissionId);
			if (!permission) {
				throw new BadRequestException(
					'Uno de los permisos a asignar no existe',
				);
			}
			permissions.push(permission?._id);
		}

		return this.roleModel.create({
			active,
			changeWarehouse,
			permissions,
			name,
		});
	}
}
