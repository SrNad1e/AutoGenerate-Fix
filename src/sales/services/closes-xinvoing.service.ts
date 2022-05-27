import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, PaginateModel, PopulateOptions, Types } from 'mongoose';

import { User } from 'src/users/entities/user.entity';
import { CreateCloseXInvoicingInput } from '../dtos/create-close-x-invoicing-input';
import { FiltersClosesXInvoicingInput } from '../dtos/filters-closes-x-invoicing-input';
import { CloseXInvoicing } from '../entities/close-x-invoicing.entity';
import { OrdersService } from './orders.service';
import { PointOfSalesService } from './point-of-sales.service';

const populate: PopulateOptions[] = [
	{
		path: 'pointOfSale',
		populate: [
			{
				path: 'authorization',
				model: 'AuthorizationDian',
			},
			{
				path: 'shop',
				model: 'Shop',
			},
		],
	},
	{
		path: 'payments',
		populate: {
			path: 'payment',
			model: 'Payment',
		},
	},
];

@Injectable()
export class ClosesXInvoingService {
	constructor(
		@InjectModel(CloseXInvoicing.name)
		private readonly closeXInvoicingModel: PaginateModel<CloseXInvoicing>,
		private readonly pointOfSalesService: PointOfSalesService,
		private readonly ordersService: OrdersService,
	) {}

	async findAll(
		{
			closeDate,
			number,
			shopId,
			sort,
			limit = 10,
			page = 1,
		}: FiltersClosesXInvoicingInput,
		user: User,
		companyId: string,
	) {
		const filters: FilterQuery<CloseXInvoicing> = {};

		if (user.username !== 'admin') {
			filters.company = new Types.ObjectId(companyId);
		}

		if (closeDate) {
			filters.closeDate = new Date(closeDate);
		}

		if (number) {
			filters.number = number;
		}

		if (shopId) {
			const pointOfSales = await this.pointOfSalesService.findAll(
				{ shopId },
				user,
				companyId,
			);
			if (pointOfSales?.docs?.length > 0) {
				const ids = pointOfSales?.docs?.map(
					(pointOfSale) => new Types.ObjectId(pointOfSale._id),
				);

				filters.pointOfSale = { $in: ids };
			}
		}
		const options = {
			limit,
			page,
			sort,
			populate,
			lean: true,
		};
		const response = await this.closeXInvoicingModel.paginate(filters, options);

		console.log(response?.docs[0]?.pointOfSale);

		return response;
	}

	async create(
		{ cashRegister, closeDate, pointOfSaleId }: CreateCloseXInvoicingInput,
		user: User,
		companyId: string,
	) {
		const pointOfSale = await this.pointOfSalesService.findById(pointOfSaleId);

		if (!pointOfSale) {
			throw new NotFoundException('El punto de venta no existe');
		}

		const summaryOrder = await this.ordersService.getSummaryOrder(
			closeDate,
			pointOfSaleId,
		);

		const closeX = await this.closeXInvoicingModel
			.findOne({
				company: new Types.ObjectId(companyId),
			})
			.lean();

		const number = (closeX?.number || 0) + 1;

		const newClose = new this.closeXInvoicingModel({
			cashRegister,
			number,
			company: new Types.ObjectId(companyId),
			pointOfSale: pointOfSale._id,
			closeDate: new Date(closeDate),
			...summaryOrder,
			user,
		});

		return (await newClose.save()).populate(populate);
	}
}
