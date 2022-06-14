import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { CreateRoleInput } from '../dtos/create-role.input';
import { FiltersRoleInput } from '../dtos/filters-role.input';
import { FiltersRolesInput } from '../dtos/filters-roles.input';
import { UpdateRoleInput } from '../dtos/update-role.input';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
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
		_id,
		active,
		name,
		limit = 10,
		page = 1,
		sort,
	}: FiltersRolesInput) {
		const filters: FilterQuery<Role> = {};

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

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

	async create(
		{ active, changeWarehouse, name, permissionIds }: CreateRoleInput,
		user: User,
	) {
		const role = await this.findOne({ name });

		if (role) {
			throw new BadRequestException(
				`El nombre del rol '${name}', ya se encuentra asignado`,
			);
		}

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

		const newRole = new this.roleModel({
			active,
			changeWarehouse,
			permissions,
			name,
			user,
		});

		return (await newRole.save()).populate(populate);
	}

	async update(
		roleId: string,
		{ active, changeWarehouse, name, permissionIds }: UpdateRoleInput,
		user: User,
	) {
		const role = await this.findById(roleId);
		if (!role) {
			throw new BadRequestException('El rol seleccionado no existe');
		}

		if (name) {
			const role = await this.findOne({ name });

			if (role) {
				throw new BadRequestException(
					`El nombre del rol '${name}', ya se encuentra asignado`,
				);
			}
		}

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

		return this.roleModel.findByIdAndUpdate(
			roleId,
			{
				$set: {
					permissions: permissions.length > 0 ? permissions : undefined,
					active,
					changeWarehouse,
					name,
					user,
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
