import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
	Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, Types } from 'mongoose';

import { FiltersWarehousesInput } from '../dtos/filters-warehouses.input';
import { Warehouse } from '../entities/warehouse.entity';
import { User } from 'src/configurations/entities/user.entity';
import { CreateWarehouseInput } from '../dtos/create-warehouse.input';
import { UpdateWarehouseInput } from '../dtos/update-warehouse.input';
import { Product } from 'src/products/entities/product.entity';
import config from 'src/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class WarehousesService {
	constructor(
		@InjectModel(Warehouse.name)
		private readonly warehouseModel: PaginateModel<Warehouse>,
		@InjectModel(Product.name)
		private readonly productModel: PaginateModel<Product>,
		@Inject(config.KEY)
		private readonly configService: ConfigType<typeof config>,
	) {}

	async findAll(
		{
			_id,
			name,
			limit = 10,
			page = 1,
			sort,
			active,
			isMain,
		}: FiltersWarehousesInput,
		user: Partial<User>,
		companyId: string,
	) {
		const filters: FilterQuery<Warehouse> = {};

		if (user.username !== this.configService.USER_ADMIN) {
			filters.company = new Types.ObjectId(companyId);
		}

		if (name) {
			filters.name = { $regex: name, $options: 'i' };
		}

		if (active !== undefined) {
			filters.active = active;
		}

		if (isMain !== undefined) {
			filters.isMain = isMain;
		}

		if (_id) {
			filters._id = new Types.ObjectId(_id);
		}

		const options = {
			limit: limit > 0 ? limit : null,
			page: page,
			sort,
			lean: true,
		};

		return this.warehouseModel.paginate(filters, options);
	}

	async getAll() {
		return this.warehouseModel.find().lean();
	}

	async findOne(params: FiltersWarehousesInput) {
		return this.warehouseModel.findOne(params).lean();
	}

	async findById(id: string) {
		return this.warehouseModel.findById(id).lean();
	}

	async create(params: CreateWarehouseInput, user: User, companyId: string) {
		const newWarehouse = new this.warehouseModel({
			...params,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			company: new Types.ObjectId(companyId),
		});

		await this.productModel.updateMany(
			{},
			{
				$addToSet: {
					stock: {
						warehouse: newWarehouse._id,
						quantity: 0,
					},
				},
			},
		);

		return newWarehouse.save();
	}

	async update(
		id: string,
		params: UpdateWarehouseInput,
		user: User,
		idCompany: string,
	) {
		const warehouse = await this.findById(id);

		if (!warehouse) {
			throw new BadRequestException('La bodega no existe');
		}

		if (
			user.username !== this.configService.USER_ADMIN &&
			warehouse.company.toString() !== idCompany
		) {
			throw new UnauthorizedException(
				'No tiene permisos para hacer cambios en esta bodega',
			);
		}

		return this.warehouseModel.findByIdAndUpdate(
			id,
			{
				$set: params,
				user: {
					username: user.username,
					name: user.name,
					_id: user._id,
				},
			},
			{
				new: true,
				lean: true,
			},
		);
	}

	/**
	 * @description obtiene una bodega con base al id de mysql
	 * @param id identificador en la base de datos mysql
	 * @returns objeto tipo warehouse
	 */
	async getByIdMysql(id: number): Promise<Warehouse> {
		return this.warehouseModel.findOne({ id }).lean();
	}
}
