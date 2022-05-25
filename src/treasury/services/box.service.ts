import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { Box } from '../entities/box.entity';

@Injectable()
export class BoxService {
	constructor(
		@InjectModel(Box.name) private readonly boxModel: PaginateModel<Box>,
	) {}

	findById(id: string) {
		return this.boxModel.findById(id).lean();
	}

	updateTotal(id: string, total: number) {
		return this.boxModel.findByIdAndUpdate(
			id,
			{
				$set: {
					total,
				},
			},
			{
				new: true,
				lean: true,
			},
		);
	}
}
