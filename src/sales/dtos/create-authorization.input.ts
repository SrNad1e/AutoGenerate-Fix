import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para la creación de una autorización' })
export class CreateAuthorizationInput {
	@Field(() => String, { description: 'Prefijo de facturación' })
	prefix: string;

	@Field(() => String, {
		description: 'resolución de facturacion',
		nullable: true,
	})
	resolution?: string;

	@Field(() => Boolean, {
		description: 'Si es una habilitación true',
		nullable: true,
	})
	qualification?: boolean;

	@Field(() => Date, {
		description: 'Fecha de inicio de la resolución',
		nullable: true,
	})
	dateInitial?: Date;

	@Field(() => Date, {
		description: 'Fecha de finalización de la resolución',
		nullable: true,
	})
	dateFinal?: Date;

	@Field(() => Number, {
		description: 'Numero inicial de la resolución',
		nullable: true,
	})
	numberInitial?: number;

	@Field(() => Number, {
		description: 'Numero final de la resolución',
		nullable: true,
	})
	numberFinal?: number;

	@Field(() => Number, {
		description: 'Numero actual de la resolución',
		nullable: true,
	})
	numberCurrent?: number;
}
