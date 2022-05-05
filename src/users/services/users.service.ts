/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { Repository } from 'typeorm';

import { Company } from 'src/configurations/entities/company.entity';
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
import { CompaniesService } from 'src/configurations/services/companies.service';
import { RolesService } from './roles.service';
import { CustomersService } from 'src/crm/services/customers.service';
import { FiltersUserInput } from '../dtos/filters-user.input';
import { Customer } from 'src/crm/entities/customer.entity';
import { CustomerType } from 'src/crm/entities/customerType.entity';

const populate = [
	{ path: 'role', model: Role.name },
	{ path: 'shop', model: Shop.name },
	{ path: 'pointOfSale', model: PointOfSale.name },
	{ path: 'companies', model: Company.name },
	{ path: 'customer', model: Customer.name },
	/*{
		path: 'customer',
		populate: {
			path: 'customerType',
			model: CustomerType.name,
		},
	},*/
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
		@InjectModel(PointOfSale.name)
		private readonly pointOfSaleModel: PaginateModel<PointOfSale>,
		private readonly companiesService: CompaniesService,
		private readonly rolesService: RolesService,
		private readonly customersService: CustomersService,
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

	async findOne({ username, customerId }: FiltersUserInput): Promise<User> {
		const filters: FilterQuery<User> = {};
		if (username) {
			filters.username = username;
		}

		if (customerId) {
			filters.customer = new Types.ObjectId(customerId);
		}
		return this.userModel.findOne(filters).populate(populate).lean();
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

	async create({
		username,
		shopId,
		companyId,
		pointOfSaleId,
		roleId,
		customerId,
		...params
	}: CreateUserInput): Promise<User> {
		const user = await this.findOne({ username });

		if (user) {
			throw new NotFoundException(
				`El usuario ${username} ya se encuentra registrado`,
			);
		}

		const role = await this.rolesService.findById(roleId);

		if (!role) {
			throw new NotFoundException('El rol seleccionado no existe');
		}

		const shop = await this.shopModel.findById(shopId);

		if (!shop || shop?.company?.toString() !== companyId) {
			throw new NotFoundException('La tienda no se encuentra registrada');
		}

		const company = await this.companiesService.findById(companyId);

		if (!company) {
			throw new NotFoundException('La empresa no se encuentra registrada');
		}

		let pointOfSale;
		if (pointOfSaleId) {
			pointOfSale = await this.pointOfSaleModel.findById(pointOfSaleId).lean();
			if (!pointOfSale || pointOfSale?.shop.toString() !== shopId) {
				throw new NotFoundException(
					'El punto de venta no existe o no esta asignado a la tienda',
				);
			}
		}

		let customer;
		if (customerId) {
			customer = await this.customersService.findById(customerId);
			if (!customer) {
				throw new NotFoundException('El cliente no existe');
			}
		}

		const newUser = new this.userModel({
			username,
			role: role._id,
			shop: shop._id,
			customer: customer._id,
			companies: [company._id],
			...params,
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
}
