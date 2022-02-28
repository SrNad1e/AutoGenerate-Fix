/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { UpdateUserInput } from '../dtos/update-user.input';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
	constructor(@InjectModel(User.name) private userModel: Model<User>) {}

	async findAll(): Promise<Partial<User[]>> {
		return await this.userModel.find().populate('role').lean();
	}

	async findOne(username: string): Promise<User> {
		return this.userModel
			.findOne({ username })
			.populate(['role', 'shop'])
			.populate({
				path: 'shop',
				populate: {
					path: 'defaultWarehouse',
					model: 'Warehouse',
				},
			})
			.lean();
	}

	async findById(id: string): Promise<Partial<User>> {
		const user = await this.userModel
			.findById(id)
			.populate(['role', 'shop'])
			.populate({
				path: 'shop',
				populate: {
					path: 'defaultWarehouse',
					model: 'Warehouse',
				},
			})
			.lean();
		if (!user) {
			throw new NotFoundException(`Usuario con id ${id} no existe`);
		}
		return user;
	}

	async getUserId(id: string): Promise<Partial<User>> {
		const user = await this.userModel
			.findById(id, { strictQuery: false })
			.populate(['role', 'shop'])
			.populate({
				path: 'shop',
				populate: {
					path: 'defaultWarehouse',
					model: 'Warehouse',
				},
			})
			.lean();
		if (!user) {
			throw new NotFoundException(`Usuario con idMysql ${id} no existe`);
		}
		return user;
	}

	async create(user: Partial<User>): Promise<User> {
		const newUser = new this.userModel({
			...user,
		});
		return (await newUser.save()).populate(['role', 'shop']);
	}

	async update(
		id: string,
		updateUserInput: UpdateUserInput,
		userUpdate: User,
	): Promise<User> {
		const user = await this.findById(id);
		if (!user) {
			throw new NotFoundException(`Usuario que intenta actualizar no existe`);
		}

		if (updateUserInput.password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(user.password, salt);

			updateUserInput.password = hashedPassword;
		}

		return this.userModel
			.findByIdAndUpdate(
				id,
				{
					$set: {
						...updateUserInput,
						user: userUpdate,
					},
				},
				{ new: true },
			)
			.populate(['role', 'shop'])
			.populate({
				path: 'shop',
				populate: {
					path: 'defaultWarehouse',
					model: 'Warehouse',
				},
			});
	}
}
