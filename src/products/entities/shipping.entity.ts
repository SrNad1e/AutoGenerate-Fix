import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Shipping {
	@Field(() => Number, { description: 'Ancho del producto' })
	width: number;

	@Field(() => Number, { description: 'Alto del producto' })
	height: number;

	@Field(() => Number, { description: 'Largo del producto' })
	long: number;

	@Field(() => Number, { description: 'Peso del producto' })
	weight: number;

	@Field(() => Number, { description: 'Volumen del producto' })
	volume: number;
}
