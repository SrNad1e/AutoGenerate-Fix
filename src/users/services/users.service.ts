/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Shop } from 'src/shops/entities/shop.entity';
import { Repository } from 'typeorm';

import { UpdateUserInput } from '../dtos/update-user.input';
import { User, UserMysql } from '../entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectRepository(UserMysql)
		private readonly userRepo: Repository<UserMysql>,
		@InjectModel(Shop.name) private readonly shopModel: Model<Shop>,
	) {}

	async getByIdMysql(id: number) {
		return this.userModel.findOne({ id });
	}

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
			})
			.lean();
	}

	async migration() {
		try {
			const usersMysql = await this.userRepo.find();

			const usersMongo = [];

			for (let i = 0; i < usersMysql.length; i++) {
				const user = usersMysql[i];
				const shop = await this.shopModel.findOne({ id: user.shop_id }).lean();
				usersMongo.push({
					name: user.name,
					username: user.user,
					password: user.password,
					shop: shop._id,
					user: {
						id: 0,
						name: 'Usuario de migración',
						username: 'migrate',
					},
					id: user.id,
				});
			}
			const shop = await this.shopModel.findOne({ id: 1 }).lean();

			usersMongo.push({
				name: 'Usuario de migración',
				username: 'migrate',
				password: '1234',
				shop: shop._id,
				user: {
					id: 0,
					name: 'migrate',
					username: 'Usuario de migración',
				},
				id: 0,
			});

			await this.userModel.create(usersMongo);

			return {
				message: 'Migración Completa',
			};
		} catch (e) {
			throw new NotFoundException(`Error al migrar los usuario ${e}`);
		}
	}
}
