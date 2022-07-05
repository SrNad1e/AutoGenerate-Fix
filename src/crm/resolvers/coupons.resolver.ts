import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	Permissions,
	RequirePermissions,
} from 'src/configurations/libs/permissions.decorator';
import { CreateCouponInput } from '../dtos/create-coupon.input';
import { FiltersCouponInput } from '../dtos/filters-coupon.input';
import { UpdateCouponInput } from '../dtos/update-coupon.input';

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

	@Mutation(() => Coupon, {
		name: 'createCoupon',
		description: 'Se encarga crear un cupón',
	})
	@RequirePermissions(Permissions.CREATE_CRM_COUPON)
	create(
		@Args('createCouponInput', {
			description: 'Parámetros para actualizar el cupoón',
		})
		_: CreateCouponInput,
		@Context() context,
	) {
		return this.couponsService.create(
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}

	@Mutation(() => Coupon, {
		name: 'updateCoupon',
		description: 'Se encarga actualizar un cupón',
	})
	@RequirePermissions(Permissions.UPDATE_CRM_COUPON)
	update(
		@Args('id', { description: 'Identificador del cupón' }) id: string,
		@Args('updateCustomerInput', {
			description: 'Parámetros para actualizar el cupón',
		})
		_: UpdateCouponInput,
		@Context() context,
	) {
		return this.couponsService.update(
			id,
			context.req.body.variables.input,
			context.req.user.user,
			context.req.user.companyId,
		);
	}
}
