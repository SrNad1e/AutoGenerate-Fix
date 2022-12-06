import { Field, InputType } from '@nestjs/graphql';
import { StatusCoupon } from '../entities/coupon.entity';

@InputType({ description: 'Filtros para consultar un cupón' })
export class FiltersCouponInput {
	@Field(() => String, { description: 'Código del cupón', nullable: true })
	code?: string;

	@Field(() => StatusCoupon, {
		description: 'Estado del cupón',
		nullable: true,
	})
	status?: StatusCoupon;
}
