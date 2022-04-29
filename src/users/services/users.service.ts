/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { Repository } from 'typeorm';

import { Company } from 'src/configurations/entities/company.entity';
import { CustomerType } from 'src/crm/entities/customerType.entity';
import { PointOfSale } from 'src/sales/entities/pointOfSale.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { FiltersUsersInput } from '../dtos/filters-users.input';
import { UpdateUserInput } from '../dtos/update-user.input';
import { Role } from '../entities/role.entity';
import { User, UserMysql } from '../entities/user.entity';
import { Warehouse } from 'src/shops/entities/warehouse.entity';
import { AuthorizationDian } from 'src/sales/entities/authorization.entity';
import { Permission } from '../entities/permission.entity';
import { CreateUserInput } from '../dtos/create-user.input';

const populate = [
	{ path: 'role', model: Role.name },
	{ path: 'shop', model: Shop.name },
	{ path: 'pointOfSale', model: PointOfSale.name },
	{ path: 'customerType', model: CustomerType.name },
	{ path: 'companies', model: Company.name },
	{
		path: 'shop',
		populate: {
			path: 'defaultWarehouse',
			model: Warehouse.name,
		},
	},
	{
		path: 'pointOfSale',
		populate: {
			path: 'authorization',
			model: AuthorizationDian.name,
		},
	},

	{
		path: 'role',
		populate: {
			path: 'permissions',
			model: Permission.name,
		},
	},
];

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: PaginateModel<User>,
		@InjectRepository(UserMysql)
		private readonly userRepo: Repository<UserMysql>,
		@InjectModel(Shop.name) private readonly shopModel: PaginateModel<Shop>,
	) {}

	async findAll(
		{
			customerTypeId,
			name,
			roleId,
			status,
			limit = 10,
			page = 1,
			sort,
		}: FiltersUsersInput,
		user: User,
	) {
		const filters: FilterQuery<User> = {};

		if (customerTypeId) {
			filters.customer = new Types.ObjectId(customerTypeId);
		}

		if (name) {
		}

		if (roleId) {
			filters.role = new Types.ObjectId(roleId);
		}

		if (status) {
			filters.status = status;
		}

		if (user?.companies) {
			filters.company = { $in: user?.companies };
		}

		const options: PaginateOptions = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		return this.userModel.paginate(filters, options);
	}

	async findOne(username: string): Promise<User> {
		return this.userModel.findOne({ username }).populate(populate).lean();
	}

	async findById(id: string): Promise<Partial<User>> {
		const user = await this.userModel.findById(id).populate(populate).lean();
		if (!user) {
			throw new NotFoundException(`Usuario con id ${id} no existe`);
		}
		return user;
	}

	async getUserId(id: string): Promise<Partial<User>> {
		const user = await this.userModel.findById(id).populate(populate).lean();
		if (!user) {
			throw new NotFoundException(`Usuario con idMysql ${id} no existe`);
		}
		return user;
	}

	async create({ username }: CreateUserInput): Promise<User> {
		//se valuda si el usuario existe

		//valida si la tienda a la que se va a asignar existe
		//valida el punto de venta
		//valida el la compañia a la que se va a asignar

		const newUser = new this.userModel({
			//...user,
		});
		return (await newUser.save()).populate(populate);
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
			.populate(populate)
			.lean();
	}

	/**
	 * @description se usa para la migración
	 * @param id identificador mysql del usuario
	 * @returns usuario mysql
	 */
	async getByIdMysql(id: number) {
		return this.userModel.findOne({ id }).populate(populate).lean();
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
