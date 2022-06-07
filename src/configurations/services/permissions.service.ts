import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
	constructor(
		@InjectModel(Permission.name)
		private readonly permissionModel: PaginateModel<Permission>,
	) {}

	async findAll() {
		const modules = await this.permissionModel.aggregate([
			{
				$group: {
					_id: ['$module'],
					module: {
						$first: '$module',
					},
					options: { $addToSet: '$option' },
				},
			},
			{
				$project: {
					_id: 0,
				},
			},
		]);

		const permissions = [];

		for (let i = 0; i < modules?.length; i++) {
			const { options, module } = modules[i];
			const newOptions = [];

			for (let j = 0; j < options.length; j++) {
				const option = options[j];
				const actions = this.permissionModel
					.find({
						module,
						option,
					})
					.projection({
						name: 1,
						description: 1,
					});

				newOptions.push({
					name: option,
					actions,
				});
			}

			permissions.push({
				module,
				options: newOptions,
			});
		}

		return permissions;
	}

	async findById(id: string) {
		return this.permissionModel.findById(id).lean();
	}
}
