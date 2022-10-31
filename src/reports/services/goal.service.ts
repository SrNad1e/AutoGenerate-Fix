import { BadRequestException, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { StatusShop } from 'src/configurations/entities/shop.entity';
import { User } from 'src/configurations/entities/user.entity';
import { ShopsService } from 'src/configurations/services/shops.service';
import { OrdersService } from 'src/sales/services/orders.service';

import { FiltersGoalStatusInput } from '../dtos/filters-goal-status.input';

@Injectable()
export class GoalService {
	constructor(
		private readonly shopsService: ShopsService,
		private readonly ordersService: OrdersService,
	) {}

	async getGoalStatus(
		{ month, shopId }: FiltersGoalStatusInput,
		user: User,
		companyId: string,
	) {
		const initialDate = dayjs(month).startOf('month').format('YYYY/MM/DD');
		const finalDate = dayjs(month).endOf('month').format('YYYY/MM/DD');

		let goal = 0;
		let shop;
		if (shopId) {
			shop = await this.shopsService.findById(shopId);
			if (!shop) {
				throw new BadRequestException('La tienda no existe o no es válida');
			}
			goal = shop?.goal;
		} else {
			const shops = await this.shopsService.findAll(
				{
					limit: 500,
					status: StatusShop.ACTIVE,
				},
				user,
				companyId,
			);

			goal = shops?.docs?.reduce((sum, shop) => sum + (shop?.goal || 0), 0);
		}

		const netSales = await this.ordersService.getNetSales({
			dateFinal: finalDate,
			dateInitial: initialDate,
			shopId: shop?._id?.toString(),
		});

		return {
			sales: netSales,
			goal,
		};
	}
}
