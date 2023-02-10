import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
	forwardRef,
	Inject
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';

import { CompaniesService } from 'src/configurations/services/companies.service';
import { CreateShopInput } from '../dtos/create-shop.input';
import { FiltersShopInput } from '../dtos/filters-shop.input';
import { FiltersShopsInput } from '../dtos/filters-shops.input';
import { UpdateShopInput } from '../dtos/update-shop.input';
import { GoalHistory, Shop, StatusShop } from '../../configurations/entities/shop.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { User } from 'src/configurations/entities/user.entity';
import dayjs from 'dayjs';
import { AddGoalHistoryInput } from '../dtos/add-goalHistory-shop.input';
import { OrdersService } from 'src/sales/services/orders.service';

const populate = [
	{
		path: 'defaultWarehouse',
		model: Warehouse.name,
	},
	{
		path: 'warehouseMain',
		model: Warehouse.name,
	},
];

@Injectable()
export class ShopsService {
	constructor(
		@InjectModel(Shop.name) private readonly shopModel: PaginateModel<Shop>,
		/*@InjectRepository(ShopMysql)
		private readonly shopMysqlRepo: Repository<ShopMysql>,*/
		@InjectModel(Warehouse.name)
		private readonly warehouseModel: PaginateModel<Warehouse>,
		private readonly companiesService: CompaniesService,
		@Inject(forwardRef(() => OrdersService))
		private readonly ordersService: OrdersService
	) { }

	async findAll(
		{ limit = 20, page = 1, name, status, sort, _id }: FiltersShopsInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<Shop> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (name) {
			filters['name'] = { $regex: name, $options: 'i' };
		}

		if (_id) {
			filters._id = _id;
		}

		if (StatusShop[status]) {
			filters.status = StatusShop[status];
		}

		const options: PaginateOptions = {
			limit,
			page,
			sort,
			lean: true,
			populate,
		};

		return this.shopModel.paginate(filters, options);
	}

	async findById(shopId: string) {
		return this.shopModel.findById(shopId).populate(populate).lean();
	}

	async findOne(filters: FiltersShopInput) {
		return this.shopModel.findOne(filters).lean();
	}

	async create(
		{ defaultWarehouseId, warehouseMainId, ...props }: CreateShopInput,
		user: User,
		companyId: string,
	) {
		const params: Partial<Shop> = {
			...props,
		};

		if (defaultWarehouseId) {
			const defaultWarehouse = await this.warehouseModel.findById(
				defaultWarehouseId,
			);

			if (!defaultWarehouse) {
				throw new NotFoundException('La bodega por defecto no exite');
			}
			params.defaultWarehouse = new Types.ObjectId(defaultWarehouseId);
		}

		if (warehouseMainId) {
			const warehouseMain = await this.warehouseModel.findById(warehouseMainId);

			if (!warehouseMain) {
				throw new NotFoundException('La bodega principal');
			}
			params.warehouseMain = new Types.ObjectId(warehouseMainId);
		}

		const newShop = new this.shopModel({
			...params,
			user: {
				username: user.username,
				name: user.name,
				_id: user._id,
			},
			company: new Types.ObjectId(companyId),
		});
		return newShop.save();
	}

	async update(
		id: string,
		{
			defaultWarehouseId,
			warehouseMainId,
			status,
			companyId,
			...props
		}: UpdateShopInput,
		user: User,
		idCompany: string,
	) {
		const params: Partial<Shop> = {
			...props,
		};

		const shop = await this.findById(id);

		if (!shop) {
			throw new BadRequestException('La tienda no existe');
		}

		if (user.username !== 'admin' && shop.company.toString() !== idCompany) {
			throw new UnauthorizedException(
				'No tiene permisos para hacer cambios en esta tienda',
			);
		}

		if (StatusShop[status]) {
			params.status = StatusShop[status];
		}

		if (defaultWarehouseId) {
			const defaultWarehouse = await this.warehouseModel.findById(
				defaultWarehouseId,
			);

			if (!defaultWarehouse) {
				throw new NotFoundException('La bodega por defecto no exite');
			}
			params.defaultWarehouse = new Types.ObjectId(defaultWarehouseId);
		}

		if (warehouseMainId) {
			const warehouseMain = await this.warehouseModel.findById(warehouseMainId);

			if (!warehouseMain) {
				throw new NotFoundException('La bodega principal');
			}
			params.warehouseMain = new Types.ObjectId(warehouseMainId);
		}

		if (companyId) {
			const company = await this.companiesService.findById(companyId);

			if (!company) {
				throw new NotFoundException('La empresa no existe');
			}
			params.company = new Types.ObjectId(companyId);
		}

		return this.shopModel.findByIdAndUpdate(
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
				populate,
			},
		);
	}

	/**
	 * @description se encarga de consultar la tienda por id de mysql
	 * @param shopId identificador de la tienda
	 * @returns tienda
	 */
	async getByIdMysql(shopId: number) {
		return this.shopModel.findOne({ shopId }).populate(populate).lean();
	}

	/**
	 * @description se encarga de consultar la tienda mayorista
	 * @returns tienda mayorista
	 */
	async getShopWholesale(shopId: string) {
		return this.shopModel.findById(shopId).populate(populate).lean();
	}

	/**
* @description se encarga de validar si la tienda tiene registros con la fecha de entrada y los almacenamos
*/
	async validateExistingRegisters(goalHistory: GoalHistory[], date: Date, existedRegister: any[]) {
		goalHistory.forEach(item => {
			if (dayjs(item.date).isSame(new Date(dayjs(date).format('YYYY/MM/01')))) {
				existedRegister.push(item)
			}
		})
	};

	/**
	* @description Si existe un registro con la fecha actual y la fecha de entrada actualiza la meta y la meta alcanzada de ese registro y retorna un nuevo array con los registros modificados
	*/
	async existedRegisterAndUpdate(goalHistory: GoalHistory[], date: Date, goalAchieved: number, goal: number) {
		let dayFormat = dayjs(date).format('YYYY/MM/01')
		let currentMonth = dayjs(new Date()).format('YYYY/MM/01')
		if (dayFormat === currentMonth) {
			let documentGoalHistoryToUpdate = goalHistory.map(item => {
				if (dayjs(item.date).isSame(new Date(dayjs(date).format('YYYY/MM/01')))) {
					item.goal = goal
					if (goalAchieved) {
						item.goalAchieved = goalAchieved
					}
				}
				return item
			})
			return documentGoalHistoryToUpdate
		};
	}

	/**
	 * @description saca el mes anterior en base a la fecha de entrada
	 */
	async formatteDate(date: Date) {
		let dateFormat = dayjs(date).format('YYYY/MM/01')

		let monthToInt = parseInt(dayjs(dateFormat).format('MM'), 10)

		let newYear = monthToInt === 1 ? parseInt(dayjs(dateFormat).format('YYYY')) - 1 : dayjs(dateFormat).format('YYYY')

		let newFormat = monthToInt === 1 ? `${newYear}/12/01` : monthToInt >= 10 ? `${newYear}/${monthToInt - 1}/01` : `${newYear}/0${monthToInt - 1}/01`;

		return newFormat;
	}

	async addGoalHistory(props: AddGoalHistoryInput) {
		const { date, goal, goalAchieved } = props.goalHistory

		const initialDate = dayjs(await this.formatteDate(date)).startOf('month').format('YYYY/MM/DD');
		const finalDate = dayjs(await this.formatteDate(date)).endOf('month').format('YYYY/MM/DD');

		let currentMonth = dayjs(new Date()).format('YYYY/MM/01')

		let goalHistoryArr = []

		let existingRegister = []

		let existedRegister: boolean;

		const shop = await this.shopModel.findById(props.shopId).lean();

		if (shop?.goalHistory) {
			await this.validateExistingRegisters(shop.goalHistory, date, existingRegister)
		}

		for (let index = 0; index < existingRegister?.length; index++) {
			if (existingRegister[index]?.date !== currentMonth && dayjs(existingRegister[index].date).isSame(new Date(dayjs(date).format('YYYY/MM/01')))) {
				existedRegister = true
				break;
			}
		}

		if (date && dayjs(date).format('YYYY/MM/01') === currentMonth && existedRegister) {
			return await this.shopModel.findByIdAndUpdate(
				props.shopId,
				{
					$set: {
						goal: goal,
						goalHistory: await this.existedRegisterAndUpdate(shop?.goalHistory, date, goalAchieved, goal)
					},
				},
				{
					new: true,
					lean: true,
					populate,
				},
			);
		}

		if (existedRegister && dayjs(date).format('YYYY/MM/01') !== currentMonth) {
			throw new Error("La tienda ya tiene un registro con la misma fecha ingresada");

		} else {
			const shopNetSales = await this.ordersService.getNetSales({
				dateInitial: initialDate,
				dateFinal: finalDate,
				shopId: props.shopId
			}) || 0

			let objBeforeGoalHistory = {
				goal: 0,
				goalAchieved: shopNetSales,
				date: new Date(dayjs(await this.formatteDate(date)).format('YYYY/MM/01')),
			}

			let goalHistorySave = {
				goal: goal,
				goalAchieved: goalAchieved,
				date: new Date(dayjs(date).format('YYYY/MM/01'))
			}

			if (dayjs(date).isSame(currentMonth)) {
				await this.shopModel.findByIdAndUpdate(
					props.shopId,
					{
						$set: {
							goal: goal
						},
					},
					{
						new: true,
						lean: true,
						populate,
					},
				);
			}

			let existBefore = false;

			for (let index = 0; index < shop?.goalHistory?.length; index++) {
				const element = shop.goalHistory[index];
				if (dayjs(element.date).isSame(dayjs(await this.formatteDate(date)).format('YYYY/MM/01'))) {
					existBefore = true
				}
			}

			let arr: any[];
			if (existBefore) {
				shop?.goalHistory?.length > 0 ? arr = [...shop.goalHistory, goalHistorySave] : arr = [goalHistorySave]
				goalHistoryArr.push(...arr)
			} else {
				shop?.goalHistory?.length > 0 ? arr = [...shop.goalHistory, objBeforeGoalHistory, goalHistorySave] : arr = [objBeforeGoalHistory, goalHistorySave]
				goalHistoryArr.push(...arr)
			}
		}

		const newShopGoalHistory = await this.shopModel.findByIdAndUpdate(
			props.shopId,
			{
				$set: {
					goalHistory: goalHistoryArr
				}
			},
			{
				populate,
				new: true,
				lean: true,
			},
		)
		return newShopGoalHistory
	}

	/*async migrate() {
		try {
			const shopsMysql = await this.shopMysqlRepo.find();
			const companyDefault = await this.companiesService.findOne('Cirotex');

			for (let i = 0; i < shopsMysql.length; i++) {
				const shopMysql = shopsMysql[i];

				const defaultWarehouse = await this.warehouseModel
					.findOne({
						name: shopMysql.name,
					})
					.lean();
				if (defaultWarehouse) {
					const newShop = new this.shopModel({
						name: shopMysql.name,
						address: shopMysql.address,
						phone: shopMysql.phone,
						shopId: shopMysql.id,
						defaultWarehouse: defaultWarehouse?._id,
						company: companyDefault._id,
						createdAt: shopMysql.created_at,
						user: {
							name: 'Administrador del Sistema',
							username: 'admin',
						},
					});
					await newShop.save();
				}
			}

			return {
				message: 'Migración completa',
			};
		} catch (e) {
			return new NotFoundException(`Error al realizar la migración ${e}`);
		}
	}*/
}
