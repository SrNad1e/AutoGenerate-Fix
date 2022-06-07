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

	async findById(id: string) {
		return this.permissionModel.findById(id).lean();
	}
}
