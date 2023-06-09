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

	async findAll(
		{ _id, active, name, limit = 10, page = 1, sort }: FiltersRolesInput,
		user: User,
	) {
		const filters: FilterQuery<Role> = {};

		if (!['master', 'admin'].includes(user.username)) {
			filters.rank = {
				$gte: user.role['rank'],
			};
		}

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		if (active !== undefined) {
			filters.active = active;
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
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
		{ active, changeWarehouse, name, permissionIds, rank }: CreateRoleInput,
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
			rank,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
		});

		return (await newRole.save()).populate(populate);
	}

	async update(
		roleId: string,
		{ active, changeWarehouse, name, permissionIds, rank }: UpdateRoleInput,
		user: User,
	) {
		const role = await this.findById(roleId);
		if (!role) {
			throw new BadRequestException('El rol seleccionado no existe');
		}

		if (name) {
			const role = await this.findOne({ name });

			if (role && role._id.toString() !== roleId) {
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
					rank,
					changeWarehouse,
					name,
					user: {
						username: user.username,
						name: user.name,
						_id: user._id,
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
