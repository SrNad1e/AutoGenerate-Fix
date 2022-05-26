import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateBoxHistoryInput } from '../dtos/create-boxHistory.input';
import { BoxHistory } from '../entities/box-history.entity';
import { BoxService } from './box.service';

@Injectable()
export class BoxHistoryService {
	constructor(
		@InjectModel(BoxHistory.name)
		private readonly boxHistoryModel: PaginateModel<BoxHistory>,
		private readonly boxService: BoxService,
	) {}

	async addCash(
		{ boxId, documentId, documentType, value }: CreateBoxHistoryInput,
		user: User,
		companyId: string,
	) {
		const box = await this.boxService.findById(boxId);
		if (!box) {
			throw new NotFoundException('La caja no existe');
		}

		const newBox = await this.boxService.updateTotal(boxId, box?.total + value);

		const newBoxHistory = new this.boxHistoryModel({
			box: newBox?._id,
			currentValue: box?.total,
			company: companyId,
			value: newBox?.total,
			documentType,
			documentId,
			user,
		});

		return newBoxHistory.save();
	}

	async deleteCash(
		{ boxId, documentId, documentType, value }: CreateBoxHistoryInput,
		user: User,
		companyId: string,
	) {
		const box = await this.boxService.findById(boxId);
		if (!box) {
			throw new NotFoundException('La caja no existe');
		}

		if (box?.total < value) {
			throw new NotFoundException('La caja no tiene suficientes fondos');
		}

		const newBox = await this.boxService.updateTotal(boxId, box?.total - value);

		const newBoxHistory = new this.boxHistoryModel({
			box: newBox?._id,
			currentValue: box?.total,
			company: companyId,
			value: newBox?.total,
			documentType,
			documentId,
			user,
		});

		return newBoxHistory.save();
	}
}
