/* eslint-disable prettier/prettier */
import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import * as shortid from 'shortid';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';

import { Company } from 'src/configurations/entities/company.entity';
import { PointOfSale } from 'src/sales/entities/pointOfSale.entity';
import { FiltersUsersInput } from '../dtos/filters-users.input';
import { UpdateUserInput } from '../dtos/update-user.input';
import { Role } from '../entities/role.entity';
import { StatusUser, User } from '../entities/user.entity';
import { AuthorizationDian } from 'src/sales/entities/authorization.entity';
import { Permission } from '../../configurations/entities/permission.entity';
import { CreateUserInput } from '../dtos/create-user.input';
import { CompaniesService } from 'src/configurations/services/companies.service';
import { RolesService } from './roles.service';
import { CustomersService } from 'src/crm/services/customers.service';
import { FiltersUserInput } from '../dtos/filters-user.input';
import { Shop } from '../entities/shop.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { CustomerType } from 'src/crm/entities/customerType.entity';
import { DocumentType } from 'src/crm/entities/documentType.entity';

const populate = [
	{ path: 'role', model: Role.name },
	{ path: 'shop', model: Shop.name },
	{ path: 'pointOfSale', model: PointOfSale.name },
	{ path: 'companies', model: Company.name },
	{
		path: 'customer',
		populate: [
			{
				path: 'customerType',
				model: CustomerType.name,
			},
			{
				path: 'documentType',
				model: DocumentType.name,
			},
		],
	},
	{
		path: 'shop',
		populate: {
			path: 'defaultWarehouse',
			model: Warehouse.name,
		},
	},
	{
		path: 'pointOfSale',
		populate: [
			{
				path: 'authorization',
				model: AuthorizationDian.name,
			},
		],
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
		companyId: string,
	) {
		const filters: FilterQuery<User> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (customerTypeId) {
			filters.customer = new Types.ObjectId(customerTypeId);
		}

		if (name) {
			filters.name = {
				$regex: name,
				$options: 'i',
			};
		}

		if (roleId) {
			filters.role = new Types.ObjectId(roleId);
		}

		if (StatusUser[status]) {
			filters.status = StatusUser[status];
		}

		if (user?.companies) {
			filters.company = { $in: user?.companies?.map((company) => company._id) };
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
			filters.username = username.toLocaleLowerCase();
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

	async create(
		{
			username,
			shopId,
			//companyId,
			pointOfSaleId,
			roleId,
			customerId,
			password,
			status,
			...params
		}: CreateUserInput,
		userCreate: User,
		idCompany: string,
	) {
		if (username) {
			const user = await this.findOne({ username });

			if (user) {
				throw new NotFoundException(
					`El usuario ${username} ya se encuentra registrado`,
				);
			}
		}

		const role = await this.rolesService.findById(roleId);

		if (!role) {
			throw new NotFoundException('El rol seleccionado no existe');
		}

		const shop = await this.shopModel.findById(shopId);

		if (!shop || shop?.company?.toString() !== idCompany) {
			throw new NotFoundException('La tienda no se encuentra registrada');
		}

		const company = await this.companiesService.findById(idCompany);

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

		let passwordGenerate = password;
		if (!password) {
			passwordGenerate = shortid.generate();
		}

		let usernameGenerate = username;
		if (!username) {
			const usernameArray = params.name.split(' ');
			const newUsername = `${usernameArray[0]}.${
				usernameArray[usernameArray.length - 1]
			}`;
			const user = await this.findOne({
				username: newUsername,
			});

			if (!user) {
				usernameGenerate = newUsername;
			} else {
				usernameGenerate = `${newUsername}${Math.floor(Math.random() * 999)}`;
			}
		}

		const newUser = new this.userModel({
			username: usernameGenerate.toLocaleLowerCase(),
			password: passwordGenerate,
			role: role?._id,
			shop: shop?._id,
			customer: customer?._id,
			pointOfSale: pointOfSale?._id,
			companies: [company?._id],
			status: StatusUser[status],
			...params,
			user: userCreate,
		});

		const response = await (await newUser.save()).populate(populate);

		return { ...response['_doc'], password: passwordGenerate };
	}

	async update(
		id: string,
		{
			status,
			customerId,
			password,
			name,
			pointOfSaleId,
			roleId,
			shopId,
			username,
		}: UpdateUserInput,
		userUpdate: User,
		idCompany: string,
	): Promise<User> {
		const user = await this.findById(id);

		if (!user) {
			throw new NotFoundException(`Usuario que intenta actualizar no existe`);
		}

		const companies = user.companies.map((company) => company.toString());

		if (userUpdate.username !== 'admin' && !companies.includes(idCompany)) {
			throw new UnauthorizedException(
				'El usuario no puede ser modificado, consulta al administrador',
			);
		}
		let newPassword;
		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			newPassword = hashedPassword;
		}

		let newStatus;
		if (status) {
			newStatus = status;
		}

		let customer;
		if (customerId) {
			customer = await this.customersService.findById(customerId);
			if (!customer) {
				throw new NotFoundException('Cliente no existe');
			}
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
		let role;
		if (roleId) {
			role = await this.rolesService.findById(roleId);

			if (!role) {
				throw new NotFoundException('El rol seleccionado no existe');
			}
		}

		if (username) {
			const user = this.findOne({ username });

			if (user) {
				throw new NotFoundException(
					'El nombre de usuario ya se encuentra asignado',
				);
			}
		}

		let shop;
		if (shopId) {
			shop = await this.shopModel.findById(shopId);
			if (!shop) {
				throw new NotFoundException('La tienda no existe');
			}
		}

		return this.userModel
			.findByIdAndUpdate(
				id,
				{
					$set: {
						status: newStatus,
						password: newPassword,
						name,
						shop: shop?._id,
						customer: customer?._id,
						pointOfSale: pointOfSale?._id || null,
						role: role?._id,
						username,
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
