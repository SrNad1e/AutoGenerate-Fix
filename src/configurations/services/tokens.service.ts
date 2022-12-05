import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuid } from 'uuid';
import { PaginateModel } from 'mongoose';

import { Token } from '../entities/token.entity';
import { User } from '../entities/user.entity';

const populate = [
	{
		path: 'user',
		model: User.name,
	},
];

@Injectable()
export class TokensService {
	constructor(
		@InjectModel(Token.name) private readonly tokenModel: PaginateModel<Token>,
	) {}

	async validateToken(code: string) {
		try {
			return this.tokenModel
				.findOne({
					code,
					active: true,
					expirationDate: {
						$gte: new Date(),
					},
				})
				.populate(populate)
				.lean();
		} catch (e) {
			throw new Error(e);
		}
	}

	async inactiveToken(user: User) {
		try {
			await this.tokenModel.updateMany(
				{ user: user?._id },
				{
					$set: {
						active: false,
					},
				},
			);

			return true;
		} catch (e) {
			throw new Error(e);
		}
	}

	async generateToken(user: User, expirationDate: Date): Promise<Token> {
		const newToken = new this.tokenModel({
			code: uuid(),
			user: user?._id,
			expirationDate,
		});
		return newToken.save();
	}
}
