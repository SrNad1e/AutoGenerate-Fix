import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { FiltersCouponInput } from '../dtos/filters-coupon.input';

import { Coupon } from '../entities/coupon.entity';
import { CouponsService } from '../services/coupons.service';

@Resolver()
export class CouponsResolver {
	constructor(private readonly couponsService: CouponsService) {}

	@Query(() => Coupon, {
		name: 'coupon',
		description: 'Consultar cupón',
	})
	@RequirePermissions(Permissions.READ_CRM_COUPONS)
	findOne(
		@Args({
			name: 'filtersCouponInput',
			description: 'Filtros para consultar un cupón',
		})
		_: FiltersCouponInput,
		@Context() context,
	) {
		return this.couponsService.findOne(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
