import { Field, InputType } from '@nestjs/graphql';
import { StatusCoupon } from '../entities/coupon.entity';

@InputType({ description: 'Datos para actualizar el cupón' })
export class UpdateCouponInput {
	@Field(() => StatusCoupon, {
		description: 'Estado del cupón',
		nullable: true,
	})
	status?: StatusCoupon;
}
