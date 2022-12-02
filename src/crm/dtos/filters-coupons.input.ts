import { Field, InputType } from '@nestjs/graphql';

import { StatusCoupon } from '../entities/coupon.entity';

@InputType({ description: 'Ordenamiento del ccupón' })
export class SortCoupon {
	@Field(() => Number, {
		description: 'ordernamiento por fecha de creación',
		nullable: true,
	})
	createdAt?: number;

	@Field(() => Number, {
		description: 'ordernamiento por consecutivo',
		nullable: true,
	})
	number?: number;

	@Field(() => Number, {
		description: 'ordernamiento por estado',
		nullable: true,
	})
	status?: number;

	@Field(() => Number, {
		description: 'ordernamiento por fecha de expiración',
		nullable: true,
	})
	expiration?: number;

	@Field(() => Number, {
		description: 'ordernamiento por fecha de actualización',
		nullable: true,
	})
	updatedAt?: number;
}

@InputType({ description: 'Filtros para consultar los cupones' })
export class FiltersCouponsInput {
	@Field(() => String, { description: 'Código del cupón', nullable: true })
	code?: string;

	@Field(() => Number, {
		description: 'Número consecutivo del cupón',
		nullable: true,
	})
	number?: number;

	@Field(() => StatusCoupon, {
		description: 'Estado del cupón',
		nullable: true,
	})
	status?: StatusCoupon;

	@Field({ description: 'Cantidad de registros', nullable: true })
	limit?: number;

	@Field({ description: 'Desde donde arranca la página', nullable: true })
	page?: number;

	@Field(() => SortCoupon, {
		description: 'Ordenamiento (1 es ascendente, -1 es descendente)',
		nullable: true,
	})
	sort: SortCoupon;
}
