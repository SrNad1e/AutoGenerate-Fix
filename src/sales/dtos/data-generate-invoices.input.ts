import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Datos para generar la facturación' })
export class DataGenerateInvoicesInput {
	@Field(() => Number, { description: 'Efectivo para facturar' })
	cash: number;

	@Field(() => String, { description: 'Fecha inicial para la facturación' })
	dateInitial: string;

	@Field(() => String, { description: 'Fecha final para la facturación' })
	dateFinal: string;

	@Field(() => String, { description: 'Identificador de la tienda a facturar' })
	shopId: string;
}
